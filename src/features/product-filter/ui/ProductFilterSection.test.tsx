import type { ComponentProps, ReactNode } from 'react';

import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProductFilterSection from './ProductFilterSection';

const mocks = vi.hoisted(() => ({
  transitionRender: vi.fn(),
}));

vi.mock('react-transition-group', () => ({
  Transition: ({ children }: { children: (state: 'entered') => ReactNode }) => {
    mocks.transitionRender();
    return children('entered');
  },
}));

type ProductFilterSectionProps = ComponentProps<typeof ProductFilterSection>;

const filter = {
  id: 1,
  name: 'Line',
  filterOption: [
    { id: 11, name_ko: '데일리 라인', name_en: 'daily-line' },
    { id: 12, name_ko: '비즈니스 라인', name_en: 'business-line' },
  ],
} as ProductFilterSectionProps['filter'];

const baseProps = {
  filter,
  isClosed: false,
  onToggle: vi.fn(),
  inputIdPrefix: 'desktop-filter',
  onCheckboxChange: vi.fn(),
  sectionTitleClassName: 'section-title',
  optionLabelClassName: 'option-label',
  duration: 300,
  defaultStyle: {},
  transitionStyles: {},
} satisfies Omit<ProductFilterSectionProps, 'effectiveCheckboxStates'>;

describe('ProductFilterSection', () => {
  beforeEach(() => {
    mocks.transitionRender.mockClear();
  });

  it('다른 필터 그룹의 체크 상태가 바뀌어도 다시 렌더링하지 않는다', () => {
    const { rerender } = render(
      <ProductFilterSection
        {...baseProps}
        effectiveCheckboxStates={{ 21: false }}
      />,
    );

    rerender(
      <ProductFilterSection
        {...baseProps}
        effectiveCheckboxStates={{ 11: false, 12: false, 21: true }}
      />,
    );

    expect(mocks.transitionRender).toHaveBeenCalledTimes(1);
  });

  it('현재 필터 그룹의 체크 상태가 바뀌면 다시 렌더링한다', () => {
    const { rerender } = render(
      <ProductFilterSection
        {...baseProps}
        effectiveCheckboxStates={{ 11: false, 12: false }}
      />,
    );

    rerender(
      <ProductFilterSection
        {...baseProps}
        effectiveCheckboxStates={{ 11: true, 12: false }}
      />,
    );

    expect(mocks.transitionRender).toHaveBeenCalledTimes(2);
  });
});
