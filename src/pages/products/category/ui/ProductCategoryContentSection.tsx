import type React from 'react';

import { ProductFilter, ProductFilterBar } from '@features/product-filter/ui';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import FilteredProducts from './FilteredProducts';

type ProductFilterProps = React.ComponentProps<typeof ProductFilter>;
type FilteredProductsProps = React.ComponentProps<typeof FilteredProducts>;

type ProductCategoryContentSectionProps = {
  isMobileViewport: boolean;
  visibleFilter: boolean;
  filterItems: ProductFilterProps['filterItems'];
  products: ProductFilterProps['products'];
  setFilteredItem: ProductFilterProps['setFilteredItem'];
  hasCheckedFilters: boolean;
  hasActivePriceFilter: boolean;
  hasActiveColorFilter: boolean;
  priceRange: ProductFilterProps['priceRange'];
  priceValue: ProductFilterProps['priceValue'];
  onPriceChange: ProductFilterProps['onPriceChange'];
  colorOptions: ProductFilterProps['colorOptions'];
  selectedColorIds: ProductFilterProps['selectedColorIds'];
  onColorChange: ProductFilterProps['onColorChange'];
  onProductQueryChange?: ProductFilterProps['onQueryChange'];
  filteredItem: FilteredProductsProps['filteredItem'];
  isPending: boolean;
  shouldWaitFilteredResult: boolean;
  totalProducts?: FilteredProductsProps['totalCount'];
  hasNextPage?: FilteredProductsProps['hasNextPage'];
  fetchNextPage?: FilteredProductsProps['fetchNextPage'];
  isFetchingNextPage?: FilteredProductsProps['isFetchingNextPage'];
  isRefreshing?: FilteredProductsProps['isRefreshing'];
  resetKey?: FilteredProductsProps['resetKey'];
};

export default function ProductCategoryContentSection({
  isMobileViewport,
  visibleFilter,
  filterItems,
  products,
  setFilteredItem,
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
  filteredItem,
  isPending,
  shouldWaitFilteredResult,
  totalProducts,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isRefreshing,
  resetKey,
}: ProductCategoryContentSectionProps) {
  const isSidebarVisible = !isMobileViewport && visibleFilter;
  const isProductListPending = isPending || shouldWaitFilteredResult;

  return (
    <section className="bg-canvas py-8 text-ink sm:py-10 dark:bg-dark-bg dark:text-surface">
      <PageWrapper>
        <div className="flex flex-col gap-8 lg:flex-row">
          {isSidebarVisible ? (
            <aside className="hidden w-full shrink-0 lg:block lg:w-65">
              <ProductFilter
                filterItems={filterItems}
                products={products}
                setFilteredItem={setFilteredItem}
                priceRange={priceRange}
                priceValue={priceValue}
                onPriceChange={onPriceChange}
                colorOptions={colorOptions}
                selectedColorIds={selectedColorIds}
                onColorChange={onColorChange}
                onQueryChange={onProductQueryChange}
                syncFilteredResultOnChange={false}
              />
            </aside>
          ) : null}
          <div className="min-w-0 flex-1">
            {hasCheckedFilters ||
            hasActivePriceFilter ||
            hasActiveColorFilter ? (
              <ProductFilterBar
                priceRange={priceRange}
                priceValue={priceValue}
                onPriceChange={onPriceChange}
                colorOptions={colorOptions}
                selectedColorIds={selectedColorIds}
                onColorChange={onColorChange}
                onQueryChange={onProductQueryChange}
              />
            ) : null}
            <FilteredProducts
              filteredItem={filteredItem}
              products={products}
              isPending={isProductListPending}
              totalCount={totalProducts}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isRefreshing={isRefreshing}
              resetKey={resetKey}
            />
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
