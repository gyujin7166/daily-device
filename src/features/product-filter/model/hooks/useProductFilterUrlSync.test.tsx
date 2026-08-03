import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FilterWithOptions } from '@entities/product/model/types';

import { useProductFilterStore } from '../store/productFilterStore';

import useProductFilterUrlSync from './useProductFilterUrlSync';

const mocks = vi.hoisted(() => ({
  setParam: vi.fn(),
}));

vi.mock('@shared/lib/router/useQueryParams', () => ({
  useQueryParams: () => ({ setParam: mocks.setParam }),
}));

const filterItems = [
  {
    id: 1,
    filterOption: [
      { id: 11, name_en: 'Bluetooth' },
      { id: 12, name_en: 'USB' },
    ],
  },
] as FilterWithOptions[];

describe('useProductFilterUrlSync', () => {
  beforeEach(() => {
    useProductFilterStore.getState().actions.resetProductFilterState();
  });

  it('URL 필터명을 체크박스 id 상태로 동기화하고 URL이 비면 초기화한다', async () => {
    const { rerender } = renderHook(
      ({ currentFilters }) =>
        useProductFilterUrlSync({ currentFilters, filterItems }),
      { initialProps: { currentFilters: 'Bluetooth' as string | null } },
    );

    await waitFor(() => {
      expect(useProductFilterStore.getState().checkboxStates).toEqual({
        11: true,
        12: false,
      });
    });

    rerender({ currentFilters: null });

    await waitFor(() => {
      expect(useProductFilterStore.getState().checkboxStates).toEqual({});
    });
  });

  it('존재하지 않는 필터명은 URL과 체크박스 상태에서 제거한다', async () => {
    useProductFilterStore.getState().actions.setCheckboxStates({ 11: true });

    renderHook(() =>
      useProductFilterUrlSync({
        currentFilters: 'Unknown',
        filterItems,
      }),
    );

    await waitFor(() => {
      expect(mocks.setParam).toHaveBeenCalledWith('filters', null);
      expect(useProductFilterStore.getState().checkboxStates).toEqual({});
    });
  });
});
