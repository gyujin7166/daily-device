import type { SetStateAction } from 'react';

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LocalCartItem } from '@entities/cart/model/types';

import { localCartItemFixture } from '../../../../../test/mocks/handlers';

import useLocalCartActions from './useLocalCartActions';

const mocks = vi.hoisted(() => ({
  setLocalCartItems: vi.fn(),
}));

vi.mock('../context/CartContext', () => ({
  useCartContext: () => ({
    setLocalCartItems: mocks.setLocalCartItems,
  }),
}));

let currentLocalCartItems: LocalCartItem[];

describe('useLocalCartActions', () => {
  beforeEach(() => {
    currentLocalCartItems = [];
    localStorage.clear();
    mocks.setLocalCartItems.mockImplementation(
      (updater: SetStateAction<LocalCartItem[]>) => {
        currentLocalCartItems =
          typeof updater === 'function'
            ? updater(currentLocalCartItems)
            : updater;
      },
    );
  });

  it('새 상품을 로컬 장바구니에 추가한다', () => {
    const { result } = renderHook(useLocalCartActions);

    act(() => {
      result.current.updateLocalCart({
        productId: 101,
        productColorId: 201,
        colorName: 'Graphite',
        quantity: 3,
        product: {
          id: 101,
          name_en: 'MX MASTER',
          price: 100_000,
          image_url: '/mx-master.png',
        },
      });
    });

    expect(currentLocalCartItems).toEqual([
      expect.objectContaining({
        productId: 101,
        productColorId: 201,
        colorName: 'Graphite',
        quantity: 3,
        product: expect.objectContaining({
          id: 101,
          name_en: 'MX MASTER',
          price: 100_000,
        }),
      }),
    ]);
  });

  it('동일 variant의 수량을 갱신하고 최대 10개로 제한한다', () => {
    currentLocalCartItems = [localCartItemFixture];
    const { result } = renderHook(useLocalCartActions);

    act(() => {
      result.current.updateLocalCart({
        productId: localCartItemFixture.productId,
        productColorId: localCartItemFixture.productColorId ?? undefined,
        colorName: localCartItemFixture.colorName ?? undefined,
        quantity: 15,
      });
    });

    expect(currentLocalCartItems).toEqual([
      { ...localCartItemFixture, quantity: 10 },
    ]);
  });

  it('선택한 variant만 로컬 장바구니에서 삭제한다', () => {
    const otherVariant = {
      ...localCartItemFixture,
      productColorId: 202,
      colorName: 'White',
    };
    currentLocalCartItems = [localCartItemFixture, otherVariant];
    localStorage.setItem('localCart', JSON.stringify(currentLocalCartItems));
    const { result } = renderHook(useLocalCartActions);

    act(() => {
      result.current.deleteLocalCartItem({
        productId: localCartItemFixture.productId,
        productColorId: localCartItemFixture.productColorId ?? undefined,
        colorName: localCartItemFixture.colorName ?? undefined,
      });
    });

    expect(currentLocalCartItems).toEqual([otherVariant]);
    expect(localStorage.getItem('localCart')).toBeNull();
  });
});
