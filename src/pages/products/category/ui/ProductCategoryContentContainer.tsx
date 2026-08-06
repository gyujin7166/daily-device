'use client';

import type { ProductPriceRange } from '@features/product-filter/model/productFilter';
import {
  FilterSortBar,
  ProductFilter,
  ProductFilterBar,
} from '@features/product-filter/ui';

import type { ProductColorFilterOption } from '@entities/product/model/types';

import FilteredProducts from './FilteredProducts';
import ProductCategoryContentSection from './ProductCategoryContentSection';
import ProductCategoryMobileFilterDrawerSection from './ProductCategoryMobileFilterDrawerSection';
import ProductCategoryStateProvider, {
  useProductCategoryFilterState,
  useProductCategoryResultState,
} from './ProductCategoryStateProvider';

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
  return (
    <ProductCategoryStateProvider
      category={category}
      priceRange={priceRange}
      colorOptions={colorOptions}
    >
      <ProductCategoryContent />
    </ProductCategoryStateProvider>
  );
}

function ProductCategoryContent() {
  return (
    <>
      <ProductCategoryFilterSortBar />
      <ProductCategoryContentSection
        sidebar={<ProductCategoryDesktopFilter />}
        filterBar={<ProductCategoryActiveFilterBar />}
        productResults={<ProductCategoryProductResults />}
      />
      <ProductCategoryMobileFilterDrawer />
    </>
  );
}

function ProductCategoryFilterSortBar() {
  const { visibleFilter, onToggleFilter } = useProductCategoryFilterState();
  const { resultCount, sortOption, onSortChange, isSorting } =
    useProductCategoryResultState();

  return (
    <FilterSortBar
      resultCount={resultCount}
      visibleFilter={visibleFilter}
      onToggleFilter={onToggleFilter}
      sortOption={sortOption}
      onSortChange={onSortChange}
      isSorting={isSorting}
    />
  );
}

function ProductCategoryDesktopFilter() {
  const {
    isMobileViewport,
    visibleFilter,
    filterItems,
    filterIsPending,
    priceRange,
    priceValue,
    onPriceChange,
    colorOptions,
    selectedColorIds,
    onColorChange,
    onProductQueryChange,
  } = useProductCategoryFilterState();

  if (isMobileViewport || !visibleFilter) {
    return null;
  }

  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-65">
      <ProductFilter
        filterItems={filterItems}
        filterIsPending={filterIsPending}
        priceRange={priceRange}
        priceValue={priceValue}
        onPriceChange={onPriceChange}
        colorOptions={colorOptions}
        selectedColorIds={selectedColorIds}
        onColorChange={onColorChange}
        onQueryChange={onProductQueryChange}
      />
    </aside>
  );
}

function ProductCategoryActiveFilterBar() {
  const {
    filterItems,
    hasCheckedFilters,
    hasActivePriceFilter,
    hasActiveColorFilter,
    priceRange,
    priceValue,
    onPriceChange,
    colorOptions,
    selectedColorIds,
    onColorChange,
    onProductQueryChange,
  } = useProductCategoryFilterState();

  if (!hasCheckedFilters && !hasActivePriceFilter && !hasActiveColorFilter) {
    return null;
  }

  return (
    <ProductFilterBar
      filterItems={filterItems}
      priceRange={priceRange}
      priceValue={priceValue}
      onPriceChange={onPriceChange}
      colorOptions={colorOptions}
      selectedColorIds={selectedColorIds}
      onColorChange={onColorChange}
      onQueryChange={onProductQueryChange}
    />
  );
}

function ProductCategoryProductResults() {
  const {
    filteredItem,
    products,
    isPending,
    totalProducts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isRefreshing,
    resetKey,
    categoryLabel,
    hasActiveFilters,
    onResetFilters,
  } = useProductCategoryResultState();

  return (
    <FilteredProducts
      filteredItem={filteredItem}
      products={products}
      isPending={isPending}
      totalCount={totalProducts}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isRefreshing={isRefreshing}
      resetKey={resetKey}
      categoryLabel={categoryLabel}
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
    />
  );
}

function ProductCategoryMobileFilterDrawer() {
  const {
    isMobileViewport,
    visibleFilter,
    onCloseMobileFilterDrawer,
    onResetMobileFilters,
    onApplyMobileFilters,
    filterItems,
    filterIsPending,
    priceRange,
    mobilePriceValue,
    onMobileDraftPriceChange,
    colorOptions,
    mobileColorIds,
    onMobileDraftColorChange,
    onProductQueryChange,
    mobileDraftCheckboxStates,
    checkboxStates,
    onMobileDraftCheckboxStatesChange,
  } = useProductCategoryFilterState();

  return (
    <ProductCategoryMobileFilterDrawerSection
      isMobileViewport={isMobileViewport}
      visibleFilter={visibleFilter}
      onClose={onCloseMobileFilterDrawer}
      onReset={onResetMobileFilters}
      onApply={onApplyMobileFilters}
      filterItems={filterItems}
      filterIsPending={filterIsPending}
      priceRange={priceRange}
      priceValue={mobilePriceValue}
      onPriceChange={onMobileDraftPriceChange}
      colorOptions={colorOptions}
      selectedColorIds={mobileColorIds}
      onColorChange={onMobileDraftColorChange}
      onProductQueryChange={onProductQueryChange}
      mobileDraftCheckboxStates={mobileDraftCheckboxStates}
      checkboxStates={checkboxStates}
      onMobileDraftCheckboxStatesChange={onMobileDraftCheckboxStatesChange}
    />
  );
}
