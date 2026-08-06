import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProductFilterStore } from '@features/product-filter/model/store/productFilterStore';

import ProductCategoryContentContainer from './ProductCategoryContentContainer';

const mocks = vi.hoisted(() => ({
  contentLayoutRender: vi.fn(),
  fetchNextPage: vi.fn().mockResolvedValue({ isError: false }),
  setParam: vi.fn(),
  setParams: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@features/product-filter/model/hooks/useProductFilterUrlSync', () => ({
  default: vi.fn(),
}));

vi.mock(
  '@features/product-filter/model/hooks/useProductCategoryPageState',
  () => ({
    default: () => ({
      filteredItem: null,
      isMobileViewport: false,
      mobileDraftCheckboxStates: null,
      shouldWaitFilteredResult: false,
      closeMobileFilterDrawer: vi.fn(),
      handleApplyMobileFilters: vi.fn(),
      handleMobileDraftCheckboxStatesChange: vi.fn(),
      handleResetMobileDraft: vi.fn(),
    }),
  }),
);

vi.mock('@features/product-filter/queries/useProductFilter', () => ({
  useProductFilter: () => ({ data: [], isPending: false }),
}));

vi.mock('@entities/product/queries/useProduct', () => ({
  useProduct: () => ({
    data: [],
    isPending: false,
    isFetching: false,
    total: 0,
    hasNextPage: false,
    fetchNextPage: mocks.fetchNextPage,
    isFetchingNextPage: false,
  }),
}));

vi.mock('@shared/hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('@shared/lib/router/useQueryParams', () => ({
  useQueryParams: () => ({
    setParam: mocks.setParam,
    setParams: mocks.setParams,
  }),
}));

vi.mock('@features/product-filter/ui', () => ({
  FilterSortBar: () => <div>filter-sort-bar</div>,
  ProductFilter: () => <div>product-filter</div>,
  ProductFilterBar: () => <div>product-filter-bar</div>,
}));

vi.mock('./ProductCategoryContentSection', () => ({
  default: () => {
    mocks.contentLayoutRender();
    return <div>content-layout</div>;
  },
}));

vi.mock('./ProductCategoryMobileFilterDrawerSection', () => ({
  default: () => null,
}));

vi.mock('./FilteredProducts', () => ({
  default: () => <div>filtered-products</div>,
}));

describe('ProductCategoryContentContainer', () => {
  beforeEach(() => {
    mocks.contentLayoutRender.mockClear();
    useProductFilterStore.getState().actions.resetProductFilterState();
  });

  it('필터 상태가 바뀌어도 정적 콘텐츠 레이아웃을 다시 렌더링하지 않는다', () => {
    render(
      <ProductCategoryContentContainer
        category="mice"
        priceRange={{ minPrice: 0, maxPrice: 100_000 }}
        colorOptions={[]}
      />,
    );

    expect(mocks.contentLayoutRender).toHaveBeenCalledTimes(1);

    act(() => {
      useProductFilterStore.getState().actions.setCheckboxStates({ 11: true });
    });

    expect(mocks.contentLayoutRender).toHaveBeenCalledTimes(1);
  });
});
