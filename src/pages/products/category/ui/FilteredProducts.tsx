import type { ComponentProps } from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { ProductList } from '@features/product/ui';

import type { CatalogProductItem } from '@entities/product/model/types';

import { usePathname } from '@shared/lib/i18n/navigation';
import { useQueryParams } from '@shared/lib/router/useQueryParams';

type FilteredProductsProps = {
  filteredItem: CatalogProductItem[] | null;
  products: CatalogProductItem[];
  isPending: boolean;
  columns?: ComponentProps<typeof ProductList>['columns'];
  totalCount?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void | Promise<void>;
  isFetchingNextPage?: boolean;
  isRefreshing?: boolean;
  resetKey?: string;
};

export default function FilteredProducts({
  filteredItem,
  products,
  isPending,
  columns = 'three',
  totalCount = 0,
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  isRefreshing = false,
  resetKey,
}: FilteredProductsProps) {
  const t = useTranslations('Products.category');
  const routeParams = useParams<{ category?: string }>();
  const pathname = usePathname() ?? '/products';
  const { setParams } = useQueryParams();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const visibleItems = filteredItem ?? products ?? [];
  const searchFilters = params.get('filters');
  const searchColors = params.get('colors');
  const searchMinPrice = params.get('minPrice');
  const searchMaxPrice = params.get('maxPrice');
  const categoryLabel =
    routeParams?.category ??
    pathname.split('/').filter(Boolean).at(-1) ??
    'products';
  const hasActiveFilters = [
    searchFilters,
    searchColors,
    searchMinPrice,
    searchMaxPrice,
  ].some((value) => !!value?.trim());
  const handleResetFilters = () => {
    setParams({
      filters: null,
      colors: null,
      minPrice: null,
      maxPrice: null,
    });
  };

  return (
    <ProductList
      products={visibleItems}
      isPending={isPending}
      columns={columns}
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
            onClick={handleResetFilters}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel-deep dark:text-surface dark:hover:bg-dark-panel-hover"
          >
            {t('resetFilters')}
          </button>
        ) : null
      }
    />
  );
}
