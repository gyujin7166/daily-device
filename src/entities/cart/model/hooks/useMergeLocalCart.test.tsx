import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LocalCartItem } from '@entities/cart/model/types';

import {
  cartItemFixture,
  localCartItemFixture,
  secondCartItemFixture,
} from '../../../../../test/mocks/handlers';

import useMergeLocalCart from './useMergeLocalCart';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock('../../queries/useAddToCart', () => ({
  useAddToCart: () => ({ mutateAsync: mocks.mutateAsync }),
}));

describe('useMergeLocalCart', () => {
  beforeEach(() => {
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
    const setLocalCartItems = vi.fn();
    localStorage.setItem('localCart', JSON.stringify(localItems));
    const { result } = renderHook(useMergeLocalCart);

    await act(async () => {
      await result.current.mergeLocalCart(localItems, setLocalCartItems, [
        cartItemFixture,
      ]);
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
    expect(setLocalCartItems).toHaveBeenCalledWith([]);
  });

  it('서버 병합 실패 시 로컬 장바구니를 유지한다', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('병합 실패'));
    const localItems = [localCartItemFixture];
    const setLocalCartItems = vi.fn();
    localStorage.setItem('localCart', JSON.stringify(localItems));
    const { result } = renderHook(useMergeLocalCart);

    await act(async () => {
      await expect(
        result.current.mergeLocalCart(localItems, setLocalCartItems, []),
      ).rejects.toThrow('병합 실패');
    });

    expect(JSON.parse(localStorage.getItem('localCart') ?? '[]')).toEqual(
      localItems,
    );
    expect(setLocalCartItems).not.toHaveBeenCalled();
  });
});
