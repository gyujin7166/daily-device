import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useCartPendingStore } from './cartPendingStore';

beforeEach(() => {
  useCartPendingStore.getState().actions.resetPendingState();
});

describe('useCartPendingStore', () => {
  it('상품 추가 상태를 variant별로 시작하고 종료한다', () => {
    const { finishAddingNewItem, startAddingNewItem } =
      useCartPendingStore.getState().actions;

    startAddingNewItem('101:201');
    expect(
      useCartPendingStore.getState().pendingAddingItemKeys['101:201'],
    ).toBe(true);

    finishAddingNewItem('101:201');
    expect(
      useCartPendingStore.getState().pendingAddingItemKeys['101:201'],
    ).toBeUndefined();
  });

  it('장바구니 동기화 상태를 variant별로 시작하고 종료한다', () => {
    const { finishCartSync, startCartSync } =
      useCartPendingStore.getState().actions;

    startCartSync('101:201');
    expect(useCartPendingStore.getState().pendingCartSyncKeys['101:201']).toBe(
      true,
    );

    finishCartSync('101:201');
    expect(
      useCartPendingStore.getState().pendingCartSyncKeys['101:201'],
    ).toBeUndefined();
  });

  it('다른 variant의 상태 변경에는 선택 구독자를 다시 렌더링하지 않는다', () => {
    const selectedPendingStates: boolean[] = [];

    renderHook(() => {
      const isPending = useCartPendingStore((state) =>
        Boolean(state.pendingCartSyncKeys['101:201']),
      );
      selectedPendingStates.push(isPending);
      return isPending;
    });

    act(() => {
      useCartPendingStore.getState().actions.startCartSync('102:202');
    });

    expect(selectedPendingStates).toEqual([false]);
  });

  it('모든 pending 상태를 초기화한다', () => {
    const { resetPendingState, startAddingNewItem, startCartSync } =
      useCartPendingStore.getState().actions;
    startAddingNewItem('101:201');
    startCartSync('102:202');

    resetPendingState();

    expect(useCartPendingStore.getState().pendingAddingItemKeys).toEqual({});
    expect(useCartPendingStore.getState().pendingCartSyncKeys).toEqual({});
  });
});
