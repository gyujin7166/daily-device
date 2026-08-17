import { useTranslations } from 'next-intl';

import { ProductList } from '@features/product/ui';

import type { CatalogProductItem } from '@entities/product/model/types';

type FilteredProductsProps = {
  filteredItem: CatalogProductItem[] | null;
  products: CatalogProductItem[];
  isPending: boolean;
  totalCount?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void | Promise<void>;
  isFetchingNextPage?: boolean;
  isRefreshing?: boolean;
  resetKey?: string;
  categoryLabel: string;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
};

export default function FilteredProducts({
  filteredItem,
  products,
  isPending,
  totalCount = 0,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  isRefreshing = false,
  resetKey,
  categoryLabel,
  hasActiveFilters,
  onResetFilters,
}: FilteredProductsProps) {
  const t = useTranslations('Products.category');
  const visibleItems = filteredItem ?? products ?? [];

  return (
    <ProductList
      products={visibleItems}
      isPending={isPending}
      columns="three"
      totalCount={totalCount}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isRefreshing={isRefreshing}
      resetKey={resetKey}
      emptyTitle={
        hasActiveFilters
          ? t('emptyFilteredTitle')
          : t('emptyCategoryTitle', { category: categoryLabel })
      }
      emptyDescription={
        hasActiveFilters
          ? t('emptyFilteredDescription')
          : t('emptyCategoryDescription')
      }
      emptyAction={
        hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel-deep dark:text-surface dark:hover:bg-dark-panel-hover"
          >
            {t('resetFilters')}
          </button>
        ) : null
      }
    />
  );
}
