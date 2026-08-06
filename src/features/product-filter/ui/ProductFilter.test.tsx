import type { ComponentProps } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProductFilterStore } from '../model/store/productFilterStore';

import ProductFilter from './ProductFilter';

const mocks = vi.hoisted(() => ({
  setParam: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@shared/lib/router/useQueryParams', () => ({
  useQueryParams: () => ({ setParam: mocks.setParam }),
}));

type ProductFilterProps = ComponentProps<typeof ProductFilter>;

const filterItems = [
  {
    id: 1,
    name: 'Line',
    filterOption: [{ id: 11, name_ko: '데일리 라인', name_en: 'daily-line' }],
  },
  {
    id: 2,
    name: '연결',
    filterOption: [{ id: 21, name_ko: '블루투스', name_en: 'bluetooth' }],
  },
] as ProductFilterProps['filterItems'];

describe('ProductFilter', () => {
  beforeEach(() => {
    mocks.setParam.mockClear();
    useProductFilterStore.getState().actions.resetProductFilterState();
  });

  it('서로 다른 필터 그룹을 연속으로 선택해도 기존 선택을 유지한다', () => {
    render(<ProductFilter filterItems={filterItems} filterIsPending={false} />);

    fireEvent.click(screen.getByLabelText('데일리 라인'));

    expect(mocks.setParam).toHaveBeenLastCalledWith('filters', 'daily-line');

    fireEvent.click(screen.getByLabelText('블루투스'));

    expect(screen.getByLabelText('데일리 라인')).toBeChecked();
    expect(screen.getByLabelText('블루투스')).toBeChecked();
    expect(useProductFilterStore.getState().checkboxStates).toMatchObject({
      11: true,
      21: true,
    });
    expect(mocks.setParam).toHaveBeenLastCalledWith(
      'filters',
      'daily-line,bluetooth',
    );
  });

  it('모바일 draft는 체크 시 URL을 즉시 변경하지 않는다', () => {
    const onCheckboxStatesChange = vi.fn();

    render(
      <ProductFilter
        filterItems={filterItems}
        filterIsPending={false}
        variant="drawer"
        checkboxStatesOverride={{}}
        onCheckboxStatesChange={onCheckboxStatesChange}
        syncQueryOnChange={false}
      />,
    );

    fireEvent.click(screen.getByLabelText('데일리 라인'));

    expect(onCheckboxStatesChange).toHaveBeenCalledWith({ 11: true });
    expect(mocks.setParam).not.toHaveBeenCalled();
  });
});
