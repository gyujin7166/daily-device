import { beforeEach, describe, expect, it } from 'vitest';

import { useCartDrawerStore } from './cartDrawerStore';

beforeEach(() => {
  useCartDrawerStore.getState().actions.closeCart();
});

describe('useCartDrawerStore', () => {
  it('장바구니 drawer를 열고 닫는다', () => {
    const { openCart, closeCart } = useCartDrawerStore.getState().actions;

    openCart();
    expect(useCartDrawerStore.getState().isCartOpen).toBe(true);

    closeCart();
    expect(useCartDrawerStore.getState().isCartOpen).toBe(false);
  });

  it('장바구니 drawer 상태를 전환한다', () => {
    const { toggleCart } = useCartDrawerStore.getState().actions;

    toggleCart();
    expect(useCartDrawerStore.getState().isCartOpen).toBe(true);

    toggleCart();
    expect(useCartDrawerStore.getState().isCartOpen).toBe(false);
  });
});
