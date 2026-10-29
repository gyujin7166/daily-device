import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { bumpCartVariantMutationRevision } from '@entities/cart/lib/cartMutationRevision';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import {
  cartItemFixture,
  cartResponseFixture,
  TEST_API_URL,
} from '../../../../../test/mocks/handlers';
import { server } from '../../../../../test/mocks/server';
import {
  createQueryWrapper,
  createTestQueryClient,
} from '../../../../../test/render';

import useCartActions from './useCartActions';

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user' } },
    status: 'authenticated',
  }),
}));

const gtag = vi.fn();
const variantKey = getCartVariantKey(cartItemFixture);
const queryKey = cartQueryKeys.cart('ko');
const addInput = {
  productId: cartItemFixture.productId,
  productColorId: cartItemFixture.productColorId ?? undefined,
  colorName: cartItemFixture.colorName ?? undefined,
  product: cartItemFixture.product,
  quantity: 3,
  trackAddToCart: true,
};

function renderActions() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(queryKey, cartResponseFixture);
  return {
    ...renderHook(useCartActions, { wrapper: createQueryWrapper(queryClient) }),
    queryClient,
  };
}

describe('회원 Add to Cart analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('gtag', gtag);
    useCartPendingStore.getState().actions.resetPendingState();
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities({ [variantKey]: 2 });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('debounce·optimistic update 후 서버 성공이 확인될 때만 증가량을 전송한다', async () => {
    let finishRequest!: () => void;
    const gate = new Promise<void>((resolve) => {
      finishRequest = resolve;
    });
    let requestCount = 0;
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, async () => {
        requestCount += 1;
        await gate;
        return HttpResponse.json({
          items: {
            ...cartResponseFixture,
            items: [{ ...cartItemFixture, quantity: 5 }],
            totalPrice: 500_000,
          },
        });
      }),
    );
    const { result, queryClient } = renderActions();
    await act(async () => {
      await result.current.handleUpsertCartItem(addInput);
    });
    expect(requestCount).toBe(0);
    expect(gtag).not.toHaveBeenCalled();
    await waitFor(() => expect(requestCount).toBe(1));
    expect(queryClient.getQueryData(queryKey)).toMatchObject({
      items: [expect.objectContaining({ quantity: 5 }), expect.anything()],
    });
    expect(gtag).not.toHaveBeenCalled();
    finishRequest();
    await waitFor(() =>
      expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'add_to_cart', {
        currency: 'KRW',
        value: 300_000,
        items: [
          {
            item_id: '101',
            item_name: 'MX MASTER',
            item_variant: 'Graphite',
            price: 100_000,
            quantity: 3,
          },
        ],
      }),
    );
  });

  it('실패한 mutation은 rollback하고 이벤트를 보내지 않는다', async () => {
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, () =>
        HttpResponse.json({ message: '실패' }, { status: 500 }),
      ),
    );
    const { result, queryClient } = renderActions();
    await act(async () => {
      await result.current.handleUpsertCartItem(addInput);
    });
    await waitFor(() =>
      expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({}),
    );
    expect(queryClient.getQueryData(queryKey)).toEqual(cartResponseFixture);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('다른 hook의 최신 revision에 밀린 성공 응답은 이벤트를 보내지 않는다', async () => {
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, () => {
        bumpCartVariantMutationRevision(variantKey);
        return HttpResponse.json({
          items: {
            ...cartResponseFixture,
            items: [{ ...cartItemFixture, quantity: 5 }],
          },
        });
      }),
    );
    const { result } = renderActions();
    await act(async () => {
      await result.current.handleUpsertCartItem(addInput);
    });
    await waitFor(() =>
      expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({}),
    );
    expect(gtag).not.toHaveBeenCalled();
  });

  it('서버에서 실제 수량이 증가하지 않은 응답에는 이벤트가 없다', async () => {
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, () =>
        HttpResponse.json({ items: cartResponseFixture }),
      ),
    );
    const { result } = renderActions();
    await act(async () => {
      await result.current.handleUpsertCartItem(addInput);
    });
    await waitFor(() =>
      expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({}),
    );
    expect(gtag).not.toHaveBeenCalled();
  });

  it('drawer 연속 수량 변경은 debounce로 합치고 add_to_cart를 전송하지 않는다', async () => {
    const quantities: number[] = [];
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, async ({ request }) => {
        const body = (await request.json()) as { quantity: number };
        quantities.push(body.quantity);
        return HttpResponse.json({
          items: {
            ...cartResponseFixture,
            items: [{ ...cartItemFixture, quantity: body.quantity }],
          },
        });
      }),
    );
    const { result } = renderActions();
    await act(async () => {
      await result.current.handleUpsertCartItem({
        ...addInput,
        quantity: 1,
        trackAddToCart: false,
      });
      await result.current.handleUpsertCartItem({
        ...addInput,
        quantity: 1,
        trackAddToCart: false,
      });
    });
    await waitFor(() =>
      expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({}),
    );
    expect(quantities).toEqual([4]);
    expect(gtag).not.toHaveBeenCalled();
  });
});
