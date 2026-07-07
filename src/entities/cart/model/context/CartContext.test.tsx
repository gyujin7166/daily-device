import type { PropsWithChildren } from 'react';

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';

import {
  cartResponseFixture,
  localCartItemFixture,
} from '../../../../../test/mocks/handlers';

import CartProvider, { useCartContext } from './CartContext';

const mocks = vi.hoisted(() => ({
  pathname: '/',
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

vi.mock('next/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('next-auth/react', () => ({
  useSession: () => mocks.session,
}));

vi.mock('@entities/cart/queries/useCart', () => ({
  useCart: () => mocks.cartResult,
}));

vi.mock('@shared/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('../hooks/useMergeLocalCart', () => ({
  default: () => ({ mergeLocalCart: mocks.mergeLocalCart }),
}));

const wrapper = ({ children }: PropsWithChildren) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.pathname = '/';
    mocks.session = { data: null, status: 'unauthenticated' };
    mocks.cartResult = { data: undefined, isFetched: false };
    mocks.mergeLocalCart.mockResolvedValue(undefined);
  });

  it('비로그인 사용자의 로컬 장바구니와 수량을 복원한다', async () => {
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));

    const { result } = renderHook(useCartContext, { wrapper });

    await waitFor(() => {
      expect(result.current.localCartItems).toEqual([localCartItemFixture]);
    });

    expect(result.current.quantities).toEqual({
      [getCartVariantKey(localCartItemFixture)]: localCartItemFixture.quantity,
    });
    expect(result.current.localTotalPrice).toBe(200_000);
  });

  it('로컬 장바구니 변경을 localStorage에 저장한다', async () => {
    const { result } = renderHook(useCartContext, { wrapper });

    act(() => {
      result.current.setLocalCartItems([
        { ...localCartItemFixture, quantity: 4 },
      ]);
    });

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('localCart') ?? '[]')).toEqual([
        { ...localCartItemFixture, quantity: 4 },
      ]);
    });
  });

  it('로그인 후 로컬 장바구니를 서버 장바구니와 한 번 병합한다', async () => {
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));
    mocks.session = {
      data: { user: { id: 'test-user' } },
      status: 'authenticated',
    };
    mocks.cartResult = { data: cartResponseFixture, isFetched: true };

    const { result, rerender } = renderHook(useCartContext, { wrapper });

    await waitFor(() => {
      expect(mocks.mergeLocalCart).toHaveBeenCalledWith(
        [localCartItemFixture],
        expect.any(Function),
        cartResponseFixture.items,
      );
    });

    expect(result.current.userCartItems).toEqual(cartResponseFixture.items);
    expect(result.current.userTotalPrice).toBe(280_000);

    rerender();
    expect(mocks.mergeLocalCart).toHaveBeenCalledTimes(1);
  });
});
