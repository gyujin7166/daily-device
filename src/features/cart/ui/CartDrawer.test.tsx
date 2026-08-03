import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';

import { cartItemFixture } from '../../../../test/mocks/handlers';

import CartDrawer from './CartDrawer';

const mocks = vi.hoisted(() => ({
  cartContentRender: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated' }),
}));

vi.mock('@entities/cart/model/store/cartLocalStore', () => ({
  useCartLocalStore: (
    selector: (state: { localCartItems: never[] }) => unknown,
  ) => selector({ localCartItems: [] }),
}));

vi.mock('@entities/cart/queries/useCart', () => ({
  selectCartItems: vi.fn(),
  useCart: () => ({ data: [cartItemFixture], isFetched: true }),
}));

vi.mock('./CartDrawerPanel', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('./CartContent', () => ({
  default: () => {
    mocks.cartContentRender();
    return <li>상품 행</li>;
  },
}));

vi.mock('./CartHeader', () => ({ default: () => null }));
vi.mock('./CartError', () => ({ default: () => null }));
vi.mock('./CartFooter', () => ({ default: () => null }));
vi.mock('./CartSkeleton', () => ({
  default: ({ itemCount }: { itemCount: number }) => (
    <li data-testid="cart-skeleton">{itemCount}</li>
  ),
}));

describe('CartDrawer', () => {
  beforeEach(() => {
    mocks.cartContentRender.mockClear();
    useCartPendingStore.getState().actions.resetPendingState();
  });

  it('상품 추가 pending 상태만 바뀌면 기존 상품 행을 다시 렌더하지 않는다', () => {
    render(<CartDrawer />);

    expect(mocks.cartContentRender).toHaveBeenCalledTimes(1);

    act(() => {
      useCartPendingStore
        .getState()
        .actions.startAddingNewItem('pending-product');
    });

    expect(screen.getByTestId('cart-skeleton')).toHaveTextContent('1');
    expect(mocks.cartContentRender).toHaveBeenCalledTimes(1);

    act(() => {
      useCartPendingStore
        .getState()
        .actions.finishAddingNewItem('pending-product');
    });

    expect(screen.queryByTestId('cart-skeleton')).not.toBeInTheDocument();
    expect(mocks.cartContentRender).toHaveBeenCalledTimes(1);
  });
});
