'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import useProductCategoryPageState from '@features/product-filter/model/hooks/useProductCategoryPageState';
import useProductFilterUrlSync from '@features/product-filter/model/hooks/useProductFilterUrlSync';
import type {
  ProductPriceFilterValue,
  ProductPriceRange,
} from '@features/product-filter/model/productFilter';
import {
  selectHasCheckedProductFilters,
  useProductFilterStore,
} from '@features/product-filter/model/store/productFilterStore';
import { useProductFilter } from '@features/product-filter/queries/useProductFilter';
import { FilterSortBar } from '@features/product-filter/ui';

import { PRODUCT_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { ProductSortOption } from '@entities/product/model/sort';
import type { ProductColorFilterOption } from '@entities/product/model/types';
import { useProduct } from '@entities/product/queries/useProduct';

import { useScrollLock } from '@shared/hooks/useScrollLock';
import { useQueryParams } from '@shared/lib/router/useQueryParams';

import ProductCategoryContentSection from './ProductCategoryContentSection';
import ProductCategoryMobileFilterDrawerSection from './ProductCategoryMobileFilterDrawerSection';

type ProductCategoryContentContainerProps = {
  category: string;
  priceRange: ProductPriceRange;
  colorOptions: ProductColorFilterOption[];
};

export default function ProductCategoryContentContainer({
  category,
  priceRange,
  colorOptions,
}: ProductCategoryContentContainerProps) {
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

  const applyPriceParams = (nextValue: ProductPriceFilterValue) => {
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
  };

  const applyColorParams = (nextColorIds: number[]) => {
    markProductQueryChanged();
    setParams({
      colors: nextColorIds.length > 0 ? nextColorIds.join(',') : undefined,
    });
  };

  const applyFilterAndPriceParams = (
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
  };

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
    setFilteredItem,
    isMobileViewport,
    mobileDraftCheckboxStates,
    shouldWaitFilteredResult,
    closeMobileFilterDrawer,
    handleApplyMobileFilters,
    handleMobileDraftCheckboxStatesChange,
    handleResetMobileDraft,
  } = useProductCategoryPageState({
    currentFilters,
    onReplaceFilters: (nextFilters) => setParam('filters', nextFilters),
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
    : (totalProducts ?? products?.length ?? 0);
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

  const mobilePriceValue = mobileDraftPriceValue ?? currentPriceValue;
  const mobileColorIds = mobileDraftColorIds ?? currentColorIds;

  const handleCloseMobileFilterDrawer = () => {
    setMobileDraftPriceValue(null);
    setMobileDraftColorIds(null);
    closeMobileFilterDrawer();
  };

  const handleResetMobileDraftFilters = () => {
    setMobileDraftPriceValue({});
    setMobileDraftColorIds([]);
    handleResetMobileDraft();
  };

  const handleApplyMobileFilterChanges = () => {
    const nextPriceValue = mobileDraftPriceValue ?? currentPriceValue;
    const nextColorIds = mobileDraftColorIds ?? currentColorIds;

    handleApplyMobileFilters((nextFilters) =>
      applyFilterAndPriceParams(nextFilters, nextPriceValue, nextColorIds),
    );
    setMobileDraftPriceValue(null);
    setMobileDraftColorIds(null);
  };

  return (
    <>
      <FilterSortBar
        resultCount={resultCount}
        visibleFilter={visibleFilter}
        onToggleFilter={() => setVisibleFilter((prev) => !prev)}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        isSorting={
          isPending ||
          isFetching ||
          isFetchingNextPage ||
          shouldWaitFilteredResult
        }
      />
      <ProductCategoryContentSection
        isMobileViewport={isMobileViewport}
        visibleFilter={visibleFilter}
        filterItems={filter}
        filterIsPending={filterIsPending}
        products={products}
        setFilteredItem={setFilteredItem}
        hasCheckedFilters={hasCheckedFilters}
        hasActivePriceFilter={hasActivePriceFilter}
        hasActiveColorFilter={hasActiveColorFilter}
        priceRange={priceRange}
        priceValue={currentPriceValue}
        onPriceChange={applyPriceParams}
        colorOptions={colorOptions}
        selectedColorIds={currentColorIds}
        onColorChange={applyColorParams}
        onProductQueryChange={markProductQueryChanged}
        filteredItem={filteredItem}
        isPending={isPending}
        totalProducts={totalProducts}
        hasNextPage={hasNextPage}
        fetchNextPage={handleFetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isRefreshing={isRefreshingProducts}
        resetKey={productListResetKey}
      />
      <ProductCategoryMobileFilterDrawerSection
        isMobileViewport={isMobileViewport}
        visibleFilter={visibleFilter}
        onClose={handleCloseMobileFilterDrawer}
        onReset={handleResetMobileDraftFilters}
        onApply={handleApplyMobileFilterChanges}
        filterItems={filter}
        filterIsPending={filterIsPending}
        products={products}
        setFilteredItem={setFilteredItem}
        priceRange={priceRange}
        priceValue={mobilePriceValue}
        onPriceChange={setMobileDraftPriceValue}
        colorOptions={colorOptions}
        selectedColorIds={mobileColorIds}
        onColorChange={setMobileDraftColorIds}
        onProductQueryChange={markProductQueryChanged}
        mobileDraftCheckboxStates={mobileDraftCheckboxStates}
        checkboxStates={checkboxStates}
        onMobileDraftCheckboxStatesChange={
          handleMobileDraftCheckboxStatesChange
        }
      />
    </>
  );
}
