import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { localCartItemFixture } from '../../../../../test/mocks/handlers';

import { useCartLocalStore } from './cartLocalStore';

describe('useCartLocalStore', () => {
  beforeEach(() => {
    useCartLocalStore.setState({
      hasHydrated: false,
      localCartItems: [],
    });
    localStorage.clear();
  });

  it('기존 배열 형식의 localCart를 복원하고 새 persist 형식으로 저장한다', async () => {
    localStorage.setItem('localCart', JSON.stringify([localCartItemFixture]));

    await act(async () => {
      await useCartLocalStore.persist.rehydrate();
    });

    expect(useCartLocalStore.getState()).toMatchObject({
      hasHydrated: true,
      localCartItems: [localCartItemFixture],
    });

    const persistedCart = JSON.parse(localStorage.getItem('localCart') ?? '{}');
    expect(persistedCart.state).toEqual({
      localCartItems: [localCartItemFixture],
    });
  });

  it('동일 variant의 수량을 갱신하고 최대 10개로 제한한다', () => {
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture],
    });

    act(() => {
      useCartLocalStore.getState().actions.updateLocalCart({
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

  it('선택한 variant만 삭제하고 남은 항목을 저장한다', () => {
    const otherVariant = {
      ...localCartItemFixture,
      productColorId: 202,
      colorName: 'White',
    };
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture, otherVariant],
    });

    act(() => {
      useCartLocalStore.getState().actions.deleteLocalCartItem({
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

  it('로컬 장바구니를 비우면 localCart 저장소를 제거한다', () => {
    useCartLocalStore.setState({
      localCartItems: [localCartItemFixture],
    });

    act(() => {
      useCartLocalStore.getState().actions.clearLocalCart();
    });

    expect(useCartLocalStore.getState().localCartItems).toEqual([]);
    expect(localStorage.getItem('localCart')).toBeNull();
  });

  it('손상된 저장 데이터가 있어도 빈 장바구니로 hydration을 완료한다', async () => {
    localStorage.setItem('localCart', '{invalid-json');

    await act(async () => {
      await useCartLocalStore.persist.rehydrate();
    });

    expect(useCartLocalStore.getState()).toMatchObject({
      hasHydrated: true,
      localCartItems: [],
    });
  });
});
