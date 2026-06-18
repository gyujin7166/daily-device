'use client';
import { useEffect, useMemo, useState } from 'react';

import type { SearchSortOption } from '@features/search/model/types';
import { useSearchResult } from '@features/search/queries/useSearchResult';
import {
  SearchFilterControls,
  SearchHeader,
  SearchHeaderSkeleton,
} from '@features/search/ui';

import { ProductSkeleton } from '@entities/product/ui';

import { decodeSlugToText } from '@shared/lib/router/slug';
import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import SearchResults from './SearchResults';

type SearchPageContainerProps = {
  query: string;
};

const SEARCH_PRODUCT_SKELETON_COUNT = 12;

export default function SearchPageContainer({
  query,
}: SearchPageContainerProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SearchSortOption>('relevance');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [stableMeta, setStableMeta] = useState<{
    total: number;
    baseTotal: number;
    visibleCount: number;
    categories: string[];
  }>({
    total: 0,
    baseTotal: 0,
    visibleCount: 0,
    categories: [],
  });

  const {
    data: items = [],
    total,
    baseTotal,
    availableCategories,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSearchResult({
    keyword: query,
    categories: selectedCategories,
    sort: sortOption,
    limit: 12,
  });

  const decodedQuery = useMemo(() => decodeSlugToText(query), [query]);
  const showInitialSkeleton = !hasLoadedOnce && isPending;
  const showProductsSkeleton = hasLoadedOnce && isPending;
  const displayTotal = showProductsSkeleton ? stableMeta.total : total;
  const displayBaseTotal = showProductsSkeleton
    ? stableMeta.baseTotal
    : baseTotal;
  const displayVisibleCount = showProductsSkeleton
    ? stableMeta.visibleCount
    : items.length;
  const displayCategories = showProductsSkeleton
    ? stableMeta.categories
    : (availableCategories ?? []);
  const shouldApplyBottomPadding =
    !hasNextPage && !showProductsSkeleton && displayTotal > 0;

  useEffect(() => {
    setSelectedCategories([]);
    setSortOption('relevance');
    setHasLoadedOnce(false);
    setStableMeta({
      total: 0,
      baseTotal: 0,
      visibleCount: 0,
      categories: [],
    });
  }, [query]);

  useEffect(() => {
    if (!isPending) {
      setHasLoadedOnce(true);
      setStableMeta({
        total,
        baseTotal,
        visibleCount: items.length,
        categories: availableCategories ?? [],
      });
    }
  }, [availableCategories, baseTotal, isPending, items.length, total]);

  if (showInitialSkeleton) {
    return (
      <PageWrapper className="mt-22.5 min-h-[50vh]">
        <SearchHeaderSkeleton />
        <ProductSkeleton
          variant="product"
          columns="four"
          length={SEARCH_PRODUCT_SKELETON_COUNT}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      className={cn(
        'mt-22.5 min-h-[50vh]',
        shouldApplyBottomPadding ? 'pb-16' : '',
      )}
    >
      <SearchHeader
        decodedQuery={decodedQuery}
        totalItems={displayTotal}
        baseTotalItems={displayBaseTotal}
      />
      <SearchFilterControls
        categories={displayCategories}
        selectedCategories={selectedCategories}
        onToggleCategory={(category) =>
          setSelectedCategories((prev) =>
            prev.includes(category)
              ? prev.filter((item) => item !== category)
              : [...prev, category],
          )
        }
        onClearCategories={() => setSelectedCategories([])}
        sortOption={sortOption}
        onSortChange={setSortOption}
        visibleCount={displayVisibleCount}
        totalCount={displayTotal}
      />
      {showProductsSkeleton ? (
        <ProductSkeleton
          variant="product"
          columns="four"
          length={SEARCH_PRODUCT_SKELETON_COUNT}
        />
      ) : (
        <SearchResults items={items} searchTerm={decodedQuery} />
      )}

      {hasNextPage && !showProductsSkeleton && (
        <div className="mt-8 mb-10 flex justify-center">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-8 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-bg dark:text-primary dark:hover:bg-blue-900/30"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? '불러오는 중...' : '더보기'}
          </button>
        </div>
      )}
    </PageWrapper>
  );
}
