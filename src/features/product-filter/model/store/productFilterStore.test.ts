import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  selectHasCheckedProductFilters,
  useProductFilterStore,
} from './productFilterStore';

describe('useProductFilterStore', () => {
  beforeEach(() => {
    useProductFilterStore.getState().actions.resetProductFilterState();
  });

  it('필터 표시 상태를 함수형 업데이트로 변경한다', () => {
    act(() => {
      useProductFilterStore
        .getState()
        .actions.setVisibleFilter((visible) => !visible);
    });

    expect(useProductFilterStore.getState().visibleFilter).toBe(false);
  });

  it('체크박스 상태와 활성 필터 여부를 필요한 값으로 선택한다', () => {
    act(() => {
      useProductFilterStore
        .getState()
        .actions.setCheckboxStates({ 11: true, 12: false });
    });

    const state = useProductFilterStore.getState();
    expect(state.checkboxStates).toEqual({ 11: true, 12: false });
    expect(selectHasCheckedProductFilters(state)).toBe(true);
  });

  it('페이지 상태를 초기값으로 되돌린다', () => {
    act(() => {
      const { setCheckboxStates, setVisibleFilter } =
        useProductFilterStore.getState().actions;
      setVisibleFilter(false);
      setCheckboxStates({ 11: true });
      useProductFilterStore.getState().actions.resetProductFilterState();
    });

    expect(useProductFilterStore.getState()).toMatchObject({
      checkboxStates: {},
      visibleFilter: true,
    });
  });
});
