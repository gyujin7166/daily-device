import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';

import useCartActions from './useCartActions';

const product = {
  id: 101,
  name_en: 'Mouse',
  price: 79_000,
  image_url: '/mouse.webp',
};
const gtag = vi.fn();

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
    useCartLocalStore.getState().actions.clearLocalCart();
    mocks.updateLocalCart.mockImplementation(
      useCartLocalStore.getState().actions.updateLocalCart,
    );
    vi.stubGlobal('gtag', gtag);
  });

  afterEach(() => vi.unstubAllGlobals());

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

  it('비회원 로컬 추가가 반영된 뒤 증가량만 전송한다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore.getState().actions.setQuantity(variantKey, 2);
    useCartLocalStore
      .getState()
      .actions.updateLocalCart({ productId: 101, quantity: 2, product });
    const { result } = renderHook(useCartActions);
    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        product,
        quantity: 3,
        trackAddToCart: true,
      });
    });
    expect(useCartLocalStore.getState().localCartItems[0].quantity).toBe(5);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'add_to_cart', {
      currency: 'KRW',
      value: 237_000,
      items: [
        { item_id: '101', item_name: 'Mouse', price: 79_000, quantity: 3 },
      ],
    });
  });

  it('최대 수량 제한으로 실제 증가한 수량만 전송한다', async () => {
    const variantKey = getCartVariantKey({ productId: 101 });
    useCartQuantityStore.getState().actions.setQuantity(variantKey, 9);
    useCartLocalStore
      .getState()
      .actions.updateLocalCart({ productId: 101, quantity: 9, product });
    const { result } = renderHook(useCartActions);
    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        product,
        quantity: 3,
        trackAddToCart: true,
      });
      await result.current.handleUpsertCartItem({
        productId: 101,
        product,
        quantity: 1,
        trackAddToCart: true,
      });
    });
    expect(gtag).toHaveBeenCalledExactlyOnceWith(
      'event',
      'add_to_cart',
      expect.objectContaining({
        value: 79_000,
        items: [expect.objectContaining({ quantity: 1 })],
      }),
    );
  });

  it('로컬 장바구니에 실제 항목이 만들어지지 않으면 전송하지 않는다', async () => {
    const { result } = renderHook(useCartActions);
    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        quantity: 1,
        trackAddToCart: true,
      });
    });
    expect(gtag).not.toHaveBeenCalled();
  });

  it('drawer의 일반 수량 변경은 add_to_cart로 기록하지 않는다', async () => {
    const { result } = renderHook(useCartActions);
    await act(async () => {
      await result.current.handleUpsertCartItem({
        productId: 101,
        product,
        quantity: 1,
      });
      await result.current.handleUpsertCartItem({
        productId: 101,
        quantity: 5,
        isDirectInput: true,
      });
      await result.current.handleUpsertCartItem({
        productId: 101,
        quantity: -1,
      });
    });
    expect(useCartLocalStore.getState().localCartItems[0].quantity).toBe(4);
    expect(gtag).not.toHaveBeenCalled();
  });
});
