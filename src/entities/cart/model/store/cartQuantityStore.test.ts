import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCartQuantityStore } from './cartQuantityStore';

beforeEach(() => {
  useCartQuantityStore.getState().actions.resetQuantities();
});

describe('useCartQuantityStore', () => {
  it('장바구니 수량 전체를 초기화한다', () => {
    useCartQuantityStore.getState().actions.replaceQuantities({
      '101:201': 2,
      '102:202': 4,
    });

    expect(useCartQuantityStore.getState().quantities).toEqual({
      '101:201': 2,
      '102:202': 4,
    });
  });

  it('선택한 variant의 수량만 변경한다', () => {
    const { replaceQuantities, setQuantity } =
      useCartQuantityStore.getState().actions;
    replaceQuantities({ '101:201': 2, '102:202': 4 });

    setQuantity('101:201', 3);

    expect(useCartQuantityStore.getState().quantities).toEqual({
      '101:201': 3,
      '102:202': 4,
    });
  });

  it('다른 variant의 수량 변경에는 선택 구독자를 다시 렌더링하지 않는다', () => {
    const { replaceQuantities, setQuantity } =
      useCartQuantityStore.getState().actions;
    replaceQuantities({ '101:201': 2, '102:202': 4 });
    const selectedQuantities: number[] = [];

    renderHook(() => {
      const quantity = useCartQuantityStore(
        (state) => state.quantities['101:201'],
      );
      selectedQuantities.push(quantity);
      return quantity;
    });

    act(() => {
      setQuantity('102:202', 5);
    });

    expect(selectedQuantities).toEqual([2]);
  });

  it('선택한 variant의 수량을 제거한다', () => {
    const { removeQuantity, replaceQuantities } =
      useCartQuantityStore.getState().actions;
    replaceQuantities({ '101:201': 2, '102:202': 4 });

    removeQuantity('101:201');

    expect(useCartQuantityStore.getState().quantities).toEqual({
      '102:202': 4,
    });
  });

  it('모든 수량을 기본 상태로 되돌린다', () => {
    const { replaceQuantities, resetQuantities } =
      useCartQuantityStore.getState().actions;
    replaceQuantities({ '101:201': 2 });

    resetQuantities();

    expect(useCartQuantityStore.getState().quantities).toEqual({});
  });
});
