'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

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
const SEARCH_AUTO_LOAD_ROOT_MARGIN = '1000px 0px';

export default function SearchPageContainer({
  query,
}: SearchPageContainerProps) {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isRequestingNextPageRef = useRef(false);
  const hasUserScrolledSinceResetRef = useRef(false);
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
    isRequestingNextPageRef.current = false;
    hasUserScrolledSinceResetRef.current = false;
    setStableMeta({
      total: 0,
      baseTotal: 0,
      visibleCount: 0,
      categories: [],
    });
  }, [query]);

  useEffect(() => {
    isRequestingNextPageRef.current = false;
    hasUserScrolledSinceResetRef.current = false;
  }, [selectedCategories, sortOption]);

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

  useEffect(() => {
    const target = loadMoreRef.current;

    if (
      !target ||
      showProductsSkeleton ||
      isPending ||
      isFetchingNextPage ||
      !hasNextPage
    ) {
      return;
    }

    const fetchNextSearchPage = () => {
      if (
        !hasUserScrolledSinceResetRef.current ||
        isRequestingNextPageRef.current
      ) {
        return;
      }

      isRequestingNextPageRef.current = true;
      void fetchNextPage().finally(() => {
        isRequestingNextPageRef.current = false;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          fetchNextSearchPage();
        }
      },
      {
        rootMargin: SEARCH_AUTO_LOAD_ROOT_MARGIN,
        threshold: 0.01,
      },
    );

    observer.observe(target);

    let scrollFrame = 0;
    const handleScroll = () => {
      hasUserScrolledSinceResetRef.current = true;

      if (scrollFrame) {
        return;
      }

      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const rect = target.getBoundingClientRect();

        if (rect.top <= window.innerHeight + 1000 && rect.bottom >= -1000) {
          fetchNextSearchPage();
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (scrollFrame) {
        cancelAnimationFrame(scrollFrame);
      }
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    showProductsSkeleton,
  ]);

  if (showInitialSkeleton) {
    return (
      <PageWrapper className="mt-22.5 flex min-h-[50vh] flex-1 flex-col">
        <SearchHeaderSkeleton />
        <ProductSkeleton
          columns="four"
          length={SEARCH_PRODUCT_SKELETON_COUNT}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      className={cn(
        'mt-22.5 flex min-h-[50vh] flex-1 flex-col',
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
          columns="four"
          length={SEARCH_PRODUCT_SKELETON_COUNT}
        />
      ) : (
        <SearchResults items={items} searchTerm={decodedQuery} />
      )}

      {isFetchingNextPage ? (
        <div className="mt-5">
          <ProductSkeleton
            columns="four"
            length={SEARCH_PRODUCT_SKELETON_COUNT}
          />
        </div>
      ) : null}

      <div
        ref={loadMoreRef}
        aria-hidden
        className={hasNextPage && !showProductsSkeleton ? 'h-40 w-full' : 'h-0'}
      />
    </PageWrapper>
  );
}
