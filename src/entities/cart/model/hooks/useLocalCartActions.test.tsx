import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { localCartItemFixture } from '../../../../../test/mocks/handlers';
import { useCartLocalStore } from '../store/cartLocalStore';

import useLocalCartActions from './useLocalCartActions';

describe('useLocalCartActions', () => {
  beforeEach(() => {
    useCartLocalStore.setState({
      hasHydrated: false,
      localCartItems: [],
    });
    localStorage.clear();
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

    expect(useCartLocalStore.getState().localCartItems).toEqual([
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
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture],
    });
    const { result } = renderHook(useLocalCartActions);

    act(() => {
      result.current.updateLocalCart({
        productId: localCartItemFixture.productId,
        productColorId: localCartItemFixture.productColorId ?? undefined,
        colorName: localCartItemFixture.colorName ?? undefined,
        quantity: 15,
      });
    });

    expect(useCartLocalStore.getState().localCartItems).toEqual([
      { ...localCartItemFixture, quantity: 10 },
    ]);
  });

  it('선택한 variant만 로컬 장바구니에서 삭제한다', () => {
    const otherVariant = {
      ...localCartItemFixture,
      productColorId: 202,
      colorName: 'White',
    };
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture, otherVariant],
    });
    const { result } = renderHook(useLocalCartActions);

    act(() => {
      result.current.deleteLocalCartItem({
        productId: localCartItemFixture.productId,
        productColorId: localCartItemFixture.productColorId ?? undefined,
        colorName: localCartItemFixture.colorName ?? undefined,
      });
    });

    expect(useCartLocalStore.getState().localCartItems).toEqual([otherVariant]);
    expect(JSON.parse(localStorage.getItem('localCart') ?? '{}').state).toEqual(
      { localCartItems: [otherVariant] },
    );
  });
});
