'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import { ProductSortBar } from '@features/product-filter/ui';

import { PRODUCT_GRID_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { ProductSortOption } from '@entities/product/model/sort';
import type { HeroTypeValue } from '@entities/product/model/types';
import { useHero } from '@entities/product/queries/useHero';
import { useProduct } from '@entities/product/queries/useProduct';

import { useBlurImages } from '@shared/hooks/useBlurImages';

import ProductAllContentSection from './ProductAllContentSection';
import ProductAllHeroSection from './ProductAllHeroSection';

type ProductAllPageContainerProps = {
  discountedOnly?: boolean;
};

export default function ProductAllPageContainer({
  discountedOnly = false,
}: ProductAllPageContainerProps) {
  const t = useTranslations('Products.allHero');
  const [sortOption, setSortOption] = useState<ProductSortOption>('relevance');
  const [retainedProductLimit, setRetainedProductLimit] = useState(
    PRODUCT_GRID_PAGE_SIZE,
  );
  const [hasUserChangedProductQuery, setHasUserChangedProductQuery] =
    useState(false);
  const heroType: HeroTypeValue = discountedOnly
    ? 'product-discounts'
    : 'product-all';
  const { data: hero } = useHero({
    type: heroType,
  });
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
  const heroItems = useMemo(
    () =>
      (hero ?? []).flatMap((item) =>
        item.image_url ? [{ ...item, image_url: item.image_url }] : [],
      ),
    [hero],
  );
  const imagesSet = useBlurImages(heroItems);
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
    <div className="bg-canvas text-ink dark:bg-dark-bg dark:text-surface">
      <ProductAllHeroSection
        content={
          discountedOnly
            ? {
                eyebrow: t('discounts.eyebrow'),
                title: t('discounts.title'),
                description: t('discounts.description'),
              }
            : {
                eyebrow: t('all.eyebrow'),
                title: t('all.title'),
                description: t('all.description'),
              }
        }
        imagesSet={imagesSet}
      />
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
    </div>
  );
}
