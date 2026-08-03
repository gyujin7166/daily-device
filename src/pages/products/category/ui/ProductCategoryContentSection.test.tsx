import type { ComponentProps, PropsWithChildren } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductCategoryContentSection from './ProductCategoryContentSection';

vi.mock('@features/product-filter/ui', () => ({
  ProductFilter: () => <div>product-filter</div>,
  ProductFilterBar: () => <div>product-filter-bar</div>,
}));

vi.mock('@shared/ui/Wrapper/PageWrapper', () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('./FilteredProducts', () => ({
  default: ({ isPending }: { isPending: boolean }) => (
    <div>{isPending ? 'product-list-skeleton' : 'product-list'}</div>
  ),
}));

type ProductCategoryContentSectionProps = ComponentProps<
  typeof ProductCategoryContentSection
>;

const defaultProps = {
  isMobileViewport: false,
  visibleFilter: true,
  filterItems: [],
  filterIsPending: false,
  products: [{} as never],
  setFilteredItem: vi.fn(),
  hasCheckedFilters: true,
  hasActivePriceFilter: false,
  hasActiveColorFilter: false,
  priceRange: { minPrice: 0, maxPrice: 100_000 },
  priceValue: {},
  onPriceChange: vi.fn(),
  colorOptions: [],
  selectedColorIds: [],
  onColorChange: vi.fn(),
  filteredItem: null,
  isPending: false,
} satisfies ProductCategoryContentSectionProps;

const renderContentSection = (
  overrides: Partial<ProductCategoryContentSectionProps> = {},
) => render(<ProductCategoryContentSection {...defaultProps} {...overrides} />);

describe('ProductCategoryContentSection', () => {
  it('필터 결과를 갱신할 때 기존 상품이 있으면 스켈레톤으로 교체하지 않는다', () => {
    renderContentSection();

    expect(screen.getByText('product-list')).toBeVisible();
    expect(screen.queryByText('product-list-skeleton')).not.toBeInTheDocument();
  });

  it('이전 필터 결과가 비어 있어도 다음 필터 갱신에서 스켈레톤을 표시하지 않는다', () => {
    renderContentSection({ products: [] });

    expect(screen.getByText('product-list')).toBeVisible();
    expect(screen.queryByText('product-list-skeleton')).not.toBeInTheDocument();
  });

  it('최초 상품 요청이 대기 중일 때는 스켈레톤을 표시한다', () => {
    renderContentSection({ products: [], isPending: true });

    expect(screen.getByText('product-list-skeleton')).toBeVisible();
    expect(screen.queryByText('product-list')).not.toBeInTheDocument();
  });
});
