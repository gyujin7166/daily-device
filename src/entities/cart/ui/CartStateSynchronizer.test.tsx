import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { CartResponse } from '@entities/cart/model/types';

import {
  cartResponseFixture,
  localCartItemFixture,
} from '../../../../test/mocks/handlers';

import CartStateSynchronizer from './CartStateSynchronizer';

const mocks = vi.hoisted(() => ({
  session: {
    data: null as null | { user: { id: string } },
    status: 'unauthenticated',
  },
  cartResult: {
    data: undefined as typeof cartResponseFixture | undefined,
    isFetched: false,
  },
  mergeLocalCart: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.session,
}));

vi.mock('@entities/cart/queries/useCart', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@entities/cart/queries/useCart')>();

  return {
    ...actual,
    useCart: <TData = CartResponse,>(options?: {
      select?: (cart: CartResponse) => TData;
    }) => ({
      ...mocks.cartResult,
      data:
        mocks.cartResult.data && options?.select
          ? options.select(mocks.cartResult.data)
          : mocks.cartResult.data,
    }),
  };
});

vi.mock('@entities/cart/model/hooks/useMergeLocalCart', () => ({
  default: () => ({ mergeLocalCart: mocks.mergeLocalCart }),
}));

describe('CartStateSynchronizer', () => {
  beforeEach(() => {
    useCartLocalStore.setState({
      hasHydrated: false,
      localCartItems: [],
    });
    localStorage.clear();
    useCartPendingStore.getState().actions.resetPendingState();
    useCartQuantityStore.getState().actions.resetQuantities();
    mocks.session = { data: null, status: 'unauthenticated' };
    mocks.cartResult = { data: undefined, isFetched: false };
    mocks.mergeLocalCart.mockResolvedValue(undefined);
  });

  it('비로그인 사용자의 로컬 장바구니와 수량을 복원한다', async () => {
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));

    render(<CartStateSynchronizer />);

    await waitFor(() => {
      expect(useCartLocalStore.getState()).toMatchObject({
        hasHydrated: true,
        localCartItems: [localCartItemFixture],
      });
    });

    expect(useCartQuantityStore.getState().quantities).toEqual({
      [getCartVariantKey(localCartItemFixture)]: localCartItemFixture.quantity,
    });
  });

  it('제거되면 일시 상태만 초기화하고 로컬 장바구니는 유지한다', async () => {
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture],
    });
    mocks.session = {
      data: { user: { id: 'test-user' } },
      status: 'authenticated',
    };
    mocks.cartResult = { data: cartResponseFixture, isFetched: true };
    const { unmount } = render(<CartStateSynchronizer />);

    await waitFor(() => {
      expect(
        Object.keys(useCartQuantityStore.getState().quantities),
      ).not.toHaveLength(0);
    });
    useCartPendingStore.getState().actions.startCartSync('101:201');

    unmount();

    expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({});
    expect(useCartQuantityStore.getState().quantities).toEqual({});
    expect(useCartLocalStore.getState().localCartItems).toEqual([
      localCartItemFixture,
    ]);
  });

  it('로그인 후 로컬 장바구니를 서버 장바구니와 한 번 병합한다', async () => {
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));
    mocks.session = {
      data: { user: { id: 'test-user' } },
      status: 'authenticated',
    };
    mocks.cartResult = { data: cartResponseFixture, isFetched: true };

    const { rerender } = render(<CartStateSynchronizer />);

    await waitFor(() => {
      expect(mocks.mergeLocalCart).toHaveBeenCalledWith(
        [localCartItemFixture],
        cartResponseFixture.items,
      );
    });

    rerender(<CartStateSynchronizer />);
    expect(mocks.mergeLocalCart).toHaveBeenCalledTimes(1);
  });

  it('로컬 장바구니 병합 중에는 해당 variant를 동기화 상태로 표시한다', async () => {
    let resolveMerge: (() => void) | undefined;
    mocks.mergeLocalCart.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveMerge = resolve;
        }),
    );
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));
    mocks.session = {
      data: { user: { id: 'test-user' } },
      status: 'authenticated',
    };
    mocks.cartResult = {
      data: { ...cartResponseFixture, items: [], totalPrice: 0 },
      isFetched: true,
    };

    render(<CartStateSynchronizer />);
    const variantKey = getCartVariantKey(localCartItemFixture);

    await waitFor(() => {
      expect(mocks.mergeLocalCart).toHaveBeenCalledOnce();
    });

    expect(useCartPendingStore.getState().pendingCartSyncKeys[variantKey]).toBe(
      true,
    );

    await act(async () => {
      resolveMerge?.();
    });

    await waitFor(() => {
      expect(
        useCartPendingStore.getState().pendingCartSyncKeys[variantKey],
      ).toBeUndefined();
    });
  });
});
