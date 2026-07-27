'use client';
import { useCallback, useEffect, useState } from 'react';

import { ProductSortBar } from '@features/product-filter/ui';

import { PRODUCT_GRID_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { ProductSortOption } from '@entities/product/model/sort';
import { useProduct } from '@entities/product/queries/useProduct';

import ProductAllContentSection from './ProductAllContentSection';

type ProductAllContentContainerProps = {
  discountedOnly?: boolean;
};

export default function ProductAllContentContainer({
  discountedOnly = false,
}: ProductAllContentContainerProps) {
  const [sortOption, setSortOption] = useState<ProductSortOption>('relevance');
  const [retainedProductLimit, setRetainedProductLimit] = useState(
    PRODUCT_GRID_PAGE_SIZE,
  );
  const [hasUserChangedProductQuery, setHasUserChangedProductQuery] =
    useState(false);
  const {
    data: products,
    isPending,
    isFetching,
    total: totalProducts,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProduct({
    category: null,
    sort: sortOption,
    discountedOnly,
    initialLimit: retainedProductLimit,
    pageSize: PRODUCT_GRID_PAGE_SIZE,
  });
  const isRefreshingProducts =
    hasUserChangedProductQuery &&
    isFetching &&
    !isPending &&
    !isFetchingNextPage;

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
      setRetainedProductLimit(
        (prevLimit) => prevLimit + PRODUCT_GRID_PAGE_SIZE,
      );
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, setRetainedProductLimit]);

  const handleSortChange = useCallback(
    (nextSort: ProductSortOption) => {
      setHasUserChangedProductQuery(true);
      setRetainedProductLimit(PRODUCT_GRID_PAGE_SIZE);
      setSortOption(nextSort);
    },
    [setRetainedProductLimit, setSortOption],
  );

  return (
    <>
      <ProductSortBar
        resultCount={totalProducts}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        isSorting={isPending || isFetching || isFetchingNextPage}
      />
      <ProductAllContentSection
        products={products}
        isPending={isPending}
        totalProducts={totalProducts}
        hasNextPage={hasNextPage}
        fetchNextPage={handleFetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isRefreshing={isRefreshingProducts}
        resetKey={sortOption}
      />
    </>
  );
}
