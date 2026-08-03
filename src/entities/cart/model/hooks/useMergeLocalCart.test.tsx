import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LocalCartItem } from '@entities/cart/model/types';

import {
  cartItemFixture,
  localCartItemFixture,
  secondCartItemFixture,
} from '../../../../../test/mocks/handlers';
import { useCartLocalStore } from '../store/cartLocalStore';

import useMergeLocalCart from './useMergeLocalCart';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock('../../queries/useAddToCart', () => ({
  useAddToCart: () => ({ mutateAsync: mocks.mutateAsync }),
}));

describe('useMergeLocalCart', () => {
  beforeEach(() => {
    useCartLocalStore.setState({
      hasHydrated: false,
      localCartItems: [],
    });
    localStorage.clear();
    mocks.mutateAsync.mockResolvedValue({});
  });

  it('중복 로컬 variant와 서버 수량을 합치고 최대 10개로 제한한다', async () => {
    const duplicateLocalItem = {
      ...localCartItemFixture,
      quantity: 9,
    };
    const secondLocalItem: LocalCartItem = {
      productId: secondCartItemFixture.productId,
      productColorId: secondCartItemFixture.productColorId,
      colorName: secondCartItemFixture.colorName,
      quantity: 3,
      product: { ...secondCartItemFixture.product },
    };
    const localItems = [
      { ...localCartItemFixture, quantity: 4 },
      duplicateLocalItem,
      secondLocalItem,
    ];
    useCartLocalStore.setState({ localCartItems: localItems });
    const { result } = renderHook(useMergeLocalCart);

    await act(async () => {
      await result.current.mergeLocalCart(localItems, [cartItemFixture]);
    });

    expect(mocks.mutateAsync).toHaveBeenCalledTimes(2);
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      productId: localCartItemFixture.productId,
      quantity: 10,
      productColorId: localCartItemFixture.productColorId,
      colorName: localCartItemFixture.colorName,
    });
    expect(mocks.mutateAsync).toHaveBeenCalledWith({
      productId: secondLocalItem.productId,
      quantity: 3,
      productColorId: undefined,
      colorName: undefined,
    });
    expect(localStorage.getItem('localCart')).toBeNull();
    expect(useCartLocalStore.getState().localCartItems).toEqual([]);
  });

  it('서버 병합 실패 시 로컬 장바구니를 유지한다', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('병합 실패'));
    const localItems = [localCartItemFixture];
    useCartLocalStore.setState({ localCartItems: localItems });
    const { result } = renderHook(useMergeLocalCart);

    await act(async () => {
      await expect(
        result.current.mergeLocalCart(localItems, []),
      ).rejects.toThrow('병합 실패');
    });

    expect(useCartLocalStore.getState().localCartItems).toEqual(localItems);
    expect(JSON.parse(localStorage.getItem('localCart') ?? '{}').state).toEqual(
      { localCartItems: localItems },
    );
  });
});
