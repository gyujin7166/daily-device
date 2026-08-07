'use client';
import { memo } from 'react';
import type React from 'react';

import { useTranslations } from 'next-intl';

import { ProductCarouselSectionSkeleton } from '@features/product-detail/ui';

import { useRecommendedProducts } from '@entities/product/queries/useRecommendedProducts';

import ProductDetailCarouselSection from './ProductDetailCarouselSection';

type ProductDetailCarouselItems = React.ComponentProps<
  typeof ProductDetailCarouselSection
>['recentlyViewedItems'];

type ProductDetailRecommendedSectionSuspenseProps = {
  category: string;
  excludeId?: number;
  recentlyViewedItems: ProductDetailCarouselItems;
};

function ProductDetailRecommendedSectionSuspense({
  category,
  excludeId,
  recentlyViewedItems,
}: ProductDetailRecommendedSectionSuspenseProps) {
  const t = useTranslations('Products.detail.carousel');
  const {
    data: recommendedItems = [],
    isPending,
    isError,
    error,
  } = useRecommendedProducts({
    category,
    excludeId,
    limit: 10,
    enabled: excludeId !== undefined,
  });
  const shouldShowInitialSkeleton =
    excludeId !== undefined &&
    isPending &&
    recommendedItems.length === 0 &&
    recentlyViewedItems.length === 0;

  if (isError && recommendedItems.length === 0) {
    throw error;
  }

  if (shouldShowInitialSkeleton) {
    return (
      <section className="pt-2">
        <ProductCarouselSectionSkeleton
          eyebrow="RECOMMENDED"
          title={t('recommended')}
        />
      </section>
    );
  }

  return (
    <ProductDetailCarouselSection
      recentlyViewedItems={recentlyViewedItems}
      recommendedItems={recommendedItems}
    />
  );
}

export default memo(ProductDetailRecommendedSectionSuspense);
