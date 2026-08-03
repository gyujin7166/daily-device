import type { ReactNode } from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartDrawerStore } from '@entities/cart/model/store/cartDrawerStore';

import CartDrawerPanel from './CartDrawerPanel';

const mocks = vi.hoisted(() => ({
  pathname: '/products',
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock('@shared/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('react-transition-group', () => ({
  Transition: ({ children }: { children: (state: 'entered') => ReactNode }) =>
    children('entered'),
}));

beforeEach(() => {
  mocks.pathname = '/products';
  useCartDrawerStore.getState().actions.closeCart();
});

describe('CartDrawerPanel', () => {
  it('경로가 변경되면 열린 drawer를 닫는다', async () => {
    const { rerender } = render(
      <CartDrawerPanel>
        <div>장바구니</div>
      </CartDrawerPanel>,
    );

    act(() => {
      useCartDrawerStore.getState().actions.openCart();
    });
    expect(useCartDrawerStore.getState().isCartOpen).toBe(true);

    mocks.pathname = '/products/keyboards';
    rerender(
      <CartDrawerPanel>
        <div>장바구니</div>
      </CartDrawerPanel>,
    );

    await waitFor(() => {
      expect(useCartDrawerStore.getState().isCartOpen).toBe(false);
    });
  });

  it('drawer가 제거되면 열린 상태를 초기화한다', () => {
    const { unmount } = render(
      <CartDrawerPanel>
        <div>장바구니</div>
      </CartDrawerPanel>,
    );

    act(() => {
      useCartDrawerStore.getState().actions.openCart();
    });
    expect(useCartDrawerStore.getState().isCartOpen).toBe(true);

    unmount();

    expect(useCartDrawerStore.getState().isCartOpen).toBe(false);
  });
});
