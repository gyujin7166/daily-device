'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

import { useSearchParams } from 'next/navigation';

import useProductCategoryPageState from '@features/product-filter/model/hooks/useProductCategoryPageState';
import useProductFilterUrlSync from '@features/product-filter/model/hooks/useProductFilterUrlSync';
import type {
  ProductFilterCheckboxStates,
  ProductPriceFilterValue,
  ProductPriceRange,
} from '@features/product-filter/model/productFilter';
import {
  selectHasCheckedProductFilters,
  useProductFilterStore,
} from '@features/product-filter/model/store/productFilterStore';
import { useProductFilter } from '@features/product-filter/queries/useProductFilter';

import { PRODUCT_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductItem,
  FilterWithOptions,
  ProductColorFilterOption,
} from '@entities/product/model/types';
import { useProduct } from '@entities/product/queries/useProduct';

import { useScrollLock } from '@shared/hooks/useScrollLock';
import { useQueryParams } from '@shared/lib/router/useQueryParams';

type ProductCategoryStateProviderProps = PropsWithChildren<{
  category: string;
  priceRange: ProductPriceRange;
  colorOptions: ProductColorFilterOption[];
}>;

type ProductCategoryFilterState = {
  filterItems: FilterWithOptions[] | undefined;
  filterIsPending: boolean;
  visibleFilter: boolean;
  isMobileViewport: boolean;
  hasCheckedFilters: boolean;
  hasActivePriceFilter: boolean;
  hasActiveColorFilter: boolean;
  priceRange: ProductPriceRange;
  priceValue: ProductPriceFilterValue;
  onPriceChange: (nextValue: ProductPriceFilterValue) => void;
  colorOptions: ProductColorFilterOption[];
  selectedColorIds: number[];
  onColorChange: (nextColorIds: number[]) => void;
  onProductQueryChange: () => void;
  onToggleFilter: () => void;
  mobilePriceValue: ProductPriceFilterValue;
  mobileColorIds: number[];
  mobileDraftCheckboxStates: ProductFilterCheckboxStates | null;
  checkboxStates: ProductFilterCheckboxStates;
  onMobileDraftPriceChange: (nextValue: ProductPriceFilterValue) => void;
  onMobileDraftColorChange: (nextColorIds: number[]) => void;
  onMobileDraftCheckboxStatesChange: React.Dispatch<
    React.SetStateAction<ProductFilterCheckboxStates>
  >;
  onCloseMobileFilterDrawer: () => void;
  onResetMobileFilters: () => void;
  onApplyMobileFilters: () => void;
};

type ProductCategoryResultState = {
  sortOption: ProductSortOption;
  resultCount: number;
  onSortChange: (nextSort: ProductSortOption) => void;
  isSorting: boolean;
  filteredItem: CatalogProductItem[] | null;
  products: CatalogProductItem[];
  isPending: boolean;
  totalProducts: number;
  hasNextPage: boolean;
  fetchNextPage: () => Promise<void>;
  isFetchingNextPage: boolean;
  isRefreshing: boolean;
  resetKey: string;
  categoryLabel: string;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
};

const ProductCategoryFilterStateContext =
  createContext<ProductCategoryFilterState | null>(null);
const ProductCategoryResultStateContext =
  createContext<ProductCategoryResultState | null>(null);

export const useProductCategoryFilterState = () => {
  const context = useContext(ProductCategoryFilterStateContext);

  if (!context) {
    throw new Error(
      'useProductCategoryFilterState must be used within ProductCategoryStateProvider',
    );
  }

  return context;
};

export const useProductCategoryResultState = () => {
  const context = useContext(ProductCategoryResultStateContext);

  if (!context) {
    throw new Error(
      'useProductCategoryResultState must be used within ProductCategoryStateProvider',
    );
  }

  return context;
};

export default function ProductCategoryStateProvider({
  category,
  priceRange,
  colorOptions,
  children,
}: ProductCategoryStateProviderProps) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const { setParam, setParams } = useQueryParams();
  const { data: filter, isPending: filterIsPending } =
    useProductFilter(category);
  const visibleFilter = useProductFilterStore((state) => state.visibleFilter);
  const checkboxStates = useProductFilterStore((state) => state.checkboxStates);
  const hasCheckedFilters = useProductFilterStore(
    selectHasCheckedProductFilters,
  );
  const { resetProductFilterState, setCheckboxStates, setVisibleFilter } =
    useProductFilterStore((state) => state.actions);
  const [sortOption, setSortOption] = useState<ProductSortOption>('relevance');
  const [retainedProductLimit, setRetainedProductLimit] =
    useState(PRODUCT_PAGE_SIZE);
  const [mobileDraftPriceValue, setMobileDraftPriceValue] =
    useState<ProductPriceFilterValue | null>(null);
  const [mobileDraftColorIds, setMobileDraftColorIds] = useState<
    number[] | null
  >(null);
  const [hasUserChangedProductQuery, setHasUserChangedProductQuery] =
    useState(false);

  const currentFilters = params.get('filters');
  const rawMinPrice = params.get('minPrice');
  const rawMaxPrice = params.get('maxPrice');
  const rawColors = params.get('colors');
  useProductFilterUrlSync({ currentFilters, filterItems: filter });
  const filterValues = useMemo(
    () =>
      currentFilters
        ?.split(',')
        .map((value) => value.trim())
        .filter(Boolean) ?? [],
    [currentFilters],
  );
  const currentPriceValue = useMemo<ProductPriceFilterValue>(() => {
    const minPrice = rawMinPrice ? Number(rawMinPrice) : undefined;
    const maxPrice = rawMaxPrice ? Number(rawMaxPrice) : undefined;

    return {
      minPrice:
        typeof minPrice === 'number' &&
        Number.isFinite(minPrice) &&
        minPrice > priceRange.minPrice &&
        minPrice <= priceRange.maxPrice
          ? minPrice
          : undefined,
      maxPrice:
        typeof maxPrice === 'number' &&
        Number.isFinite(maxPrice) &&
        maxPrice < priceRange.maxPrice &&
        maxPrice >= priceRange.minPrice
          ? maxPrice
          : undefined,
    };
  }, [priceRange.maxPrice, priceRange.minPrice, rawMaxPrice, rawMinPrice]);
  const hasActivePriceFilter =
    typeof currentPriceValue.minPrice === 'number' ||
    typeof currentPriceValue.maxPrice === 'number';
  const currentColorIds = useMemo(() => {
    const validColorIds = new Set(colorOptions.map((color) => color.id));

    return Array.from(
      new Set(
        (rawColors ?? '')
          .split(',')
          .map((value) => Number(value.trim()))
          .filter(
            (value) =>
              Number.isInteger(value) && value > 0 && validColorIds.has(value),
          ),
      ),
    ).sort((a, b) => a - b);
  }, [colorOptions, rawColors]);
  const hasActiveColorFilter = currentColorIds.length > 0;
  const hasActiveFilters =
    filterValues.length > 0 || hasActivePriceFilter || hasActiveColorFilter;
  const productListResetKey = useMemo(
    () =>
      [
        category,
        sortOption,
        filterValues.join(','),
        currentColorIds.join(','),
        currentPriceValue.minPrice ?? '',
        currentPriceValue.maxPrice ?? '',
      ].join('|'),
    [
      category,
      currentColorIds,
      currentPriceValue.maxPrice,
      currentPriceValue.minPrice,
      filterValues,
      sortOption,
    ],
  );

  const markProductQueryChanged = useCallback(() => {
    setHasUserChangedProductQuery(true);
  }, [setHasUserChangedProductQuery]);

  const applyPriceParams = useCallback(
    (nextValue: ProductPriceFilterValue) => {
      markProductQueryChanged();
      setParams({
        minPrice:
          typeof nextValue.minPrice === 'number'
            ? `${nextValue.minPrice}`
            : undefined,
        maxPrice:
          typeof nextValue.maxPrice === 'number'
            ? `${nextValue.maxPrice}`
            : undefined,
      });
    },
    [markProductQueryChanged, setParams],
  );

  const applyColorParams = useCallback(
    (nextColorIds: number[]) => {
      markProductQueryChanged();
      setParams({
        colors: nextColorIds.length > 0 ? nextColorIds.join(',') : undefined,
      });
    },
    [markProductQueryChanged, setParams],
  );

  const applyFilterAndPriceParams = useCallback(
    (
      nextFilters: string,
      nextPriceValue: ProductPriceFilterValue,
      nextColorIds: number[],
    ) => {
      markProductQueryChanged();
      setParams({
        filters: nextFilters,
        minPrice:
          typeof nextPriceValue.minPrice === 'number'
            ? `${nextPriceValue.minPrice}`
            : undefined,
        maxPrice:
          typeof nextPriceValue.maxPrice === 'number'
            ? `${nextPriceValue.maxPrice}`
            : undefined,
        colors: nextColorIds.length > 0 ? nextColorIds.join(',') : undefined,
      });
    },
    [markProductQueryChanged, setParams],
  );

  const replaceFilters = useCallback(
    (nextFilters: string) => setParam('filters', nextFilters),
    [setParam],
  );

  const resetFilters = useCallback(() => {
    markProductQueryChanged();
    setParams({
      filters: null,
      colors: null,
      minPrice: null,
      maxPrice: null,
    });
  }, [markProductQueryChanged, setParams]);

  const {
    data: products,
    isPending,
    isFetching,
    total: totalProducts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProduct({
    sort: sortOption,
    category,
    filters: filterValues,
    colorIds: currentColorIds,
    minPrice: currentPriceValue.minPrice,
    maxPrice: currentPriceValue.maxPrice,
    initialLimit: retainedProductLimit,
  });
  const {
    filteredItem,
    isMobileViewport,
    mobileDraftCheckboxStates,
    shouldWaitFilteredResult,
    closeMobileFilterDrawer,
    handleApplyMobileFilters,
    handleMobileDraftCheckboxStatesChange,
    handleResetMobileDraft,
  } = useProductCategoryPageState({
    currentFilters,
    onReplaceFilters: replaceFilters,
    visibleFilter,
    setVisibleFilter,
    filterItems: filter,
    filterIsPending,
    checkboxStates,
    setCheckboxStates,
    products,
    productsIsFetching: isFetching,
    productListResetKey,
  });
  useScrollLock(isMobileViewport && visibleFilter);

  const resultCount = shouldWaitFilteredResult
    ? 0
    : (totalProducts ?? products.length);
  const isRefreshingProducts =
    hasUserChangedProductQuery &&
    isFetching &&
    !isPending &&
    !isFetchingNextPage &&
    !shouldWaitFilteredResult;

  useEffect(() => {
    setRetainedProductLimit(PRODUCT_PAGE_SIZE);
  }, [category]);

  useEffect(
    () => () => resetProductFilterState(),
    [category, resetProductFilterState],
  );

  useEffect(() => {
    if (
      isPending ||
      isFetching ||
      isFetchingNextPage ||
      !hasNextPage ||
      products.length >= retainedProductLimit
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isPending,
    products.length,
    retainedProductLimit,
  ]);

  const handleFetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    const result = await fetchNextPage();

    if (!result.isError) {
      setRetainedProductLimit((prevLimit) => prevLimit + PRODUCT_PAGE_SIZE);
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, setRetainedProductLimit]);

  const handleSortChange = useCallback(
    (nextSort: ProductSortOption) => {
      markProductQueryChanged();
      setRetainedProductLimit(PRODUCT_PAGE_SIZE);
      setSortOption(nextSort);
    },
    [markProductQueryChanged, setRetainedProductLimit, setSortOption],
  );

  const handleToggleFilter = useCallback(
    () => setVisibleFilter((prev) => !prev),
    [setVisibleFilter],
  );

  const mobilePriceValue = mobileDraftPriceValue ?? currentPriceValue;
  const mobileColorIds = mobileDraftColorIds ?? currentColorIds;

  const handleCloseMobileFilterDrawer = useCallback(() => {
    setMobileDraftPriceValue(null);
    setMobileDraftColorIds(null);
    closeMobileFilterDrawer();
  }, [
    closeMobileFilterDrawer,
    setMobileDraftColorIds,
    setMobileDraftPriceValue,
  ]);

  const handleResetMobileDraftFilters = useCallback(() => {
    setMobileDraftPriceValue({});
    setMobileDraftColorIds([]);
    handleResetMobileDraft();
  }, [
    handleResetMobileDraft,
    setMobileDraftColorIds,
    setMobileDraftPriceValue,
  ]);

  const handleApplyMobileFilterChanges = useCallback(() => {
    const nextPriceValue = mobileDraftPriceValue ?? currentPriceValue;
    const nextColorIds = mobileDraftColorIds ?? currentColorIds;

    handleApplyMobileFilters((nextFilters) =>
      applyFilterAndPriceParams(nextFilters, nextPriceValue, nextColorIds),
    );
    setMobileDraftPriceValue(null);
    setMobileDraftColorIds(null);
  }, [
    applyFilterAndPriceParams,
    currentColorIds,
    currentPriceValue,
    handleApplyMobileFilters,
    mobileDraftColorIds,
    mobileDraftPriceValue,
    setMobileDraftColorIds,
    setMobileDraftPriceValue,
  ]);

  const filterState = useMemo<ProductCategoryFilterState>(
    () => ({
      filterItems: filter,
      filterIsPending,
      visibleFilter,
      isMobileViewport,
      hasCheckedFilters,
      hasActivePriceFilter,
      hasActiveColorFilter,
      priceRange,
      priceValue: currentPriceValue,
      onPriceChange: applyPriceParams,
      colorOptions,
      selectedColorIds: currentColorIds,
      onColorChange: applyColorParams,
      onProductQueryChange: markProductQueryChanged,
      onToggleFilter: handleToggleFilter,
      mobilePriceValue,
      mobileColorIds,
      mobileDraftCheckboxStates,
      checkboxStates,
      onMobileDraftPriceChange: setMobileDraftPriceValue,
      onMobileDraftColorChange: setMobileDraftColorIds,
      onMobileDraftCheckboxStatesChange: handleMobileDraftCheckboxStatesChange,
      onCloseMobileFilterDrawer: handleCloseMobileFilterDrawer,
      onResetMobileFilters: handleResetMobileDraftFilters,
      onApplyMobileFilters: handleApplyMobileFilterChanges,
    }),
    [
      applyColorParams,
      applyPriceParams,
      checkboxStates,
      colorOptions,
      currentColorIds,
      currentPriceValue,
      filter,
      filterIsPending,
      handleApplyMobileFilterChanges,
      handleCloseMobileFilterDrawer,
      handleMobileDraftCheckboxStatesChange,
      handleResetMobileDraftFilters,
      handleToggleFilter,
      hasActiveColorFilter,
      hasActivePriceFilter,
      hasCheckedFilters,
      isMobileViewport,
      markProductQueryChanged,
      mobileColorIds,
      mobileDraftCheckboxStates,
      mobilePriceValue,
      priceRange,
      setMobileDraftColorIds,
      setMobileDraftPriceValue,
      visibleFilter,
    ],
  );
  const resultState = useMemo<ProductCategoryResultState>(
    () => ({
      sortOption,
      resultCount,
      onSortChange: handleSortChange,
      isSorting:
        isPending ||
        isFetching ||
        isFetchingNextPage ||
        shouldWaitFilteredResult,
      filteredItem,
      products,
      isPending,
      totalProducts,
      hasNextPage,
      fetchNextPage: handleFetchNextPage,
      isFetchingNextPage,
      isRefreshing: isRefreshingProducts,
      resetKey: productListResetKey,
      categoryLabel: category,
      hasActiveFilters,
      onResetFilters: resetFilters,
    }),
    [
      filteredItem,
      category,
      handleFetchNextPage,
      handleSortChange,
      hasNextPage,
      hasActiveFilters,
      isFetching,
      isFetchingNextPage,
      isPending,
      isRefreshingProducts,
      productListResetKey,
      products,
      resultCount,
      resetFilters,
      shouldWaitFilteredResult,
      sortOption,
      totalProducts,
    ],
  );

  return (
    <ProductCategoryFilterStateContext.Provider value={filterState}>
      <ProductCategoryResultStateContext.Provider value={resultState}>
        {children}
      </ProductCategoryResultStateContext.Provider>
    </ProductCategoryFilterStateContext.Provider>
  );
}
