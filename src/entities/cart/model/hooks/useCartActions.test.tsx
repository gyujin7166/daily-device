import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';

import useCartActions from './useCartActions';

const mocks = vi.hoisted(() => ({
  addToCartMutateAsync: vi.fn(),
  deleteCartItemMutate: vi.fn(),
  deleteLocalCartItem: vi.fn(),
  updateLocalCart: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'unauthenticated' }),
}));

vi.mock('../../queries/useAddToCart', () => ({
  useAddToCart: () => ({
    mutateAsync: mocks.addToCartMutateAsync,
    isSuccess: false,
  }),
}));

vi.mock('../../queries/useDeleteCartItem', () => ({
  useDeleteCartItem: () => ({ mutate: mocks.deleteCartItemMutate }),
}));

vi.mock('./useLocalCartActions', () => ({
  default: () => ({
    deleteLocalCartItem: mocks.deleteLocalCartItem,
    updateLocalCart: mocks.updateLocalCart,
  }),
}));

describe('useCartActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartPendingStore.getState().actions.resetPendingState();
    useCartQuantityStore.getState().actions.resetQuantities();
  });

  it('최신 수량을 기준으로 선택한 variant의 수량을 변경한다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities({ [variantKey]: 2 });
    const { result } = renderHook(useCartActions);

    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        quantity: 1,
      });
    });

    expect(useCartQuantityStore.getState().quantities[variantKey]).toBe(3);
    expect(mocks.updateLocalCart).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 101, quantity: 3 }),
    );
  });

  it('상품을 삭제하면 선택한 variant의 수량도 제거한다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities({ [variantKey]: 2 });
    const { result } = renderHook(useCartActions);

    await act(async () => {
      await result.current.handleDeleteCartItem({ productId: 101 });
    });

    expect(useCartQuantityStore.getState().quantities[variantKey]).toBe(
      undefined,
    );
    expect(mocks.deleteLocalCartItem).toHaveBeenCalledWith({
      productId: 101,
      productColorId: undefined,
      colorName: undefined,
    });
  });

  it('동일 variant가 pending 상태이면 중복 추가를 건너뛴다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities({ [variantKey]: 2 });
    useCartPendingStore.getState().actions.startCartSync(variantKey);
    const { result } = renderHook(useCartActions);

    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        quantity: 1,
        skipIfPending: true,
      });
    });

    expect(useCartQuantityStore.getState().quantities[variantKey]).toBe(2);
    expect(mocks.updateLocalCart).not.toHaveBeenCalled();
  });

  it('상품 추가 중에는 동일 variant를 삭제하지 않는다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore
      .getState()
      .actions.replaceQuantities({ [variantKey]: 2 });
    useCartPendingStore.getState().actions.startAddingNewItem(variantKey);
    const { result } = renderHook(useCartActions);

    await act(async () => {
      await result.current.handleDeleteCartItem({ productId: 101 });
    });

    expect(useCartQuantityStore.getState().quantities[variantKey]).toBe(2);
    expect(mocks.deleteLocalCartItem).not.toHaveBeenCalled();
  });
});
