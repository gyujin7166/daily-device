import type React from 'react';

import { IconX } from '@tabler/icons-react';

import { ProductFilter } from '@features/product-filter/ui';

import { cn } from '@shared/lib/utils/style';

type ProductFilterProps = React.ComponentProps<typeof ProductFilter>;

type ProductCategoryMobileFilterDrawerSectionProps = {
  isMobileViewport: boolean;
  visibleFilter: boolean;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  filterItems: ProductFilterProps['filterItems'];
  products: ProductFilterProps['products'];
  setFilteredItem: ProductFilterProps['setFilteredItem'];
  priceRange: ProductFilterProps['priceRange'];
  priceValue: ProductFilterProps['priceValue'];
  onPriceChange: ProductFilterProps['onPriceChange'];
  colorOptions: ProductFilterProps['colorOptions'];
  selectedColorIds: ProductFilterProps['selectedColorIds'];
  onColorChange: ProductFilterProps['onColorChange'];
  onProductQueryChange?: ProductFilterProps['onQueryChange'];
  mobileDraftCheckboxStates: Record<number, boolean> | null;
  checkboxStates: Record<number, boolean>;
  onMobileDraftCheckboxStatesChange: ProductFilterProps['onCheckboxStatesChange'];
};

export default function ProductCategoryMobileFilterDrawerSection({
  isMobileViewport,
  visibleFilter,
  onClose,
  onReset,
  onApply,
  filterItems,
  products,
  setFilteredItem,
  priceRange,
  priceValue,
  onPriceChange,
  colorOptions,
  selectedColorIds,
  onColorChange,
  onProductQueryChange,
  mobileDraftCheckboxStates,
  checkboxStates,
  onMobileDraftCheckboxStatesChange,
}: ProductCategoryMobileFilterDrawerSectionProps) {
  const isDrawerVisible = isMobileViewport && visibleFilter;

  if (!isMobileViewport) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 z-220',
        isDrawerVisible ? '' : 'pointer-events-none',
      )}
    >
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-ink/45 transition-opacity duration-300',
          isDrawerVisible ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full bg-surface transition-transform duration-300 dark:bg-dark-panel',
          isDrawerVisible ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-ink dark:text-surface">
            필터
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-canvas hover:text-ink dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
            aria-label="필터 닫기"
          >
            <IconX size={20} />
          </button>
        </div>
        <div className="flex h-[calc(100%-65px)] flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <ProductFilter
              filterItems={filterItems}
              products={products}
              setFilteredItem={setFilteredItem}
              variant="drawer"
              priceRange={priceRange}
              priceValue={priceValue}
              onPriceChange={onPriceChange}
              colorOptions={colorOptions}
              selectedColorIds={selectedColorIds}
              onColorChange={onColorChange}
              onQueryChange={onProductQueryChange}
              checkboxStatesOverride={
                mobileDraftCheckboxStates ?? checkboxStates
              }
              onCheckboxStatesChange={onMobileDraftCheckboxStatesChange}
              syncQueryOnChange={false}
              syncFilteredResultOnChange={false}
            />
          </div>
          <div className="border-t border-line bg-surface px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-dark-border dark:bg-dark-panel">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-ink transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-panel-deep dark:text-surface dark:hover:bg-dark-panel-hover"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={onApply}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-surface transition-colors hover:bg-primary/90"
              >
                적용하기
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
