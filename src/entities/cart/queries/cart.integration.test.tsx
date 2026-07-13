import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import type { CartResponse } from '@entities/cart/model/types';

import { HttpError } from '@shared/lib/errors/httpError';

import {
  cartItemFixture,
  cartResponseFixture,
  secondCartItemFixture,
  TEST_API_URL,
} from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import {
  createQueryWrapper,
  createTestQueryClient,
} from '../../../../test/render';

import { cartQueryKeys } from './queryKeys';
import { useAddToCart } from './useAddToCart';
import { useCart } from './useCart';
import { useDeleteCartItem } from './useDeleteCartItem';

const CART_LOCALE = 'ko';

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user' } },
    status: 'authenticated',
  }),
}));

const renderCartHook = <T,>(hook: () => T) => {
  const queryClient = createTestQueryClient();
  const result = renderHook(hook, {
    wrapper: createQueryWrapper(queryClient),
  });

  return { ...result, queryClient };
};

const setCart = (
  queryClient: ReturnType<typeof createTestQueryClient>,
  cart: CartResponse,
) => {
  queryClient.setQueryData(cartQueryKeys.cart(CART_LOCALE), cart);
};

describe('useCart', () => {
  it('장바구니를 조회한다', async () => {
    const { result } = renderCartHook(useCart);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(cartResponseFixture);
  });

  it('빈 장바구니를 정상 상태로 처리한다', async () => {
    const emptyCart: CartResponse = { id: 0, items: [], totalPrice: 0 };
    server.use(
      http.get(`${TEST_API_URL}/api/cart`, () =>
        HttpResponse.json({ items: emptyCart, message: 'Success' }),
      ),
    );

    const { result } = renderCartHook(useCart);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(emptyCart);
  });

  it('인증 오류는 재시도하지 않는다', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${TEST_API_URL}/api/cart`, () => {
        requestCount += 1;
        return HttpResponse.json(
          { message: '로그인이 필요합니다.' },
          { status: 401 },
        );
      }),
    );

    const { result } = renderCartHook(useCart);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(HttpError);
    expect(result.current.error).toMatchObject({ status: 401 });
    expect(requestCount).toBe(1);
  });
});

describe('useAddToCart', () => {
  it('수량 변경 요청을 보내고 서버 응답을 캐시에 반영한다', async () => {
    let receivedBody: Record<string, unknown> | undefined;
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, async ({ request }) => {
        receivedBody = (await request.json()) as Record<string, unknown>;
        const updatedItem = { ...cartItemFixture, quantity: 5 };
        const updatedCart: CartResponse = {
          id: cartResponseFixture.id,
          items: [updatedItem],
          totalPrice: 500_000,
        };
        return HttpResponse.json({ items: updatedCart, message: 'Success' });
      }),
    );

    const initialCart: CartResponse = {
      ...cartResponseFixture,
      items: [cartItemFixture],
      totalPrice: 200_000,
    };
    const { result, queryClient } = renderCartHook(useAddToCart);
    setCart(queryClient, initialCart);

    await act(async () => {
      await result.current.mutateAsync({
        productId: cartItemFixture.productId,
        quantity: 5,
        cartItemId: cartItemFixture.id,
        productColorId: cartItemFixture.productColorId ?? undefined,
        colorName: cartItemFixture.colorName ?? undefined,
      });
    });

    expect(receivedBody).toMatchObject({
      productId: cartItemFixture.productId,
      quantity: 5,
      cartItemId: cartItemFixture.id,
      productColorId: cartItemFixture.productColorId,
      colorName: cartItemFixture.colorName,
    });
    expect(queryClient.getQueryData(cartQueryKeys.cart(CART_LOCALE))).toEqual({
      ...initialCart,
      items: [{ ...cartItemFixture, quantity: 5 }],
      totalPrice: 500_000,
    });
  });

  it('수량 변경 실패 시 이전 장바구니로 되돌린다', async () => {
    server.use(
      http.post(`${TEST_API_URL}/api/cart`, () =>
        HttpResponse.json({ message: '수량 변경 실패' }, { status: 500 }),
      ),
    );

    const initialCart: CartResponse = {
      ...cartResponseFixture,
      items: [cartItemFixture],
      totalPrice: 200_000,
    };
    const { result, queryClient } = renderCartHook(useAddToCart);
    setCart(queryClient, initialCart);

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          productId: cartItemFixture.productId,
          quantity: 5,
          cartItemId: cartItemFixture.id,
          productColorId: cartItemFixture.productColorId ?? undefined,
          colorName: cartItemFixture.colorName ?? undefined,
        }),
      ).rejects.toThrow('수량 변경 실패');
    });

    expect(queryClient.getQueryData(cartQueryKeys.cart(CART_LOCALE))).toEqual(
      initialCart,
    );
  });
});

describe('useDeleteCartItem', () => {
  it('상품을 장바구니 캐시에서 삭제한다', async () => {
    const { result, queryClient } = renderCartHook(useDeleteCartItem);
    setCart(queryClient, cartResponseFixture);

    await act(async () => {
      await result.current.mutateAsync({
        cartItemId: secondCartItemFixture.id,
        productId: secondCartItemFixture.productId,
      });
    });

    expect(queryClient.getQueryData(cartQueryKeys.cart(CART_LOCALE))).toEqual({
      ...cartResponseFixture,
      items: [cartItemFixture],
      totalPrice: 200_000,
    });
  });

  it('상품 삭제 실패 시 이전 장바구니로 되돌린다', async () => {
    server.use(
      http.delete(`${TEST_API_URL}/api/cart/items/:cartItemId`, () =>
        HttpResponse.json({ message: '상품 삭제 실패' }, { status: 500 }),
      ),
    );

    const { result, queryClient } = renderCartHook(useDeleteCartItem);
    setCart(queryClient, cartResponseFixture);

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          cartItemId: secondCartItemFixture.id,
          productId: secondCartItemFixture.productId,
        }),
      ).rejects.toThrow('상품 삭제 실패');
    });

    expect(queryClient.getQueryData(cartQueryKeys.cart(CART_LOCALE))).toEqual(
      cartResponseFixture,
    );
  });
});
