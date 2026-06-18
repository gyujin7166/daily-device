'use client';
import type React from 'react';

import { useSuspenseRecommendedProducts } from '@entities/product/queries/useRecommendedProducts';

import ProductDetailCarouselSection from './ProductDetailCarouselSection';

type ProductDetailCarouselItems = React.ComponentProps<
  typeof ProductDetailCarouselSection
>['recentlyViewedItems'];

type ProductDetailRecommendedSectionSuspenseProps = {
  category: string;
  excludeId?: number;
  recentlyViewedItems: ProductDetailCarouselItems;
};

export default function ProductDetailRecommendedSectionSuspense({
  category,
  excludeId,
  recentlyViewedItems,
}: ProductDetailRecommendedSectionSuspenseProps) {
  const { data: recommendedItems = [] } = useSuspenseRecommendedProducts({
    category,
    excludeId,
    limit: 10,
    enabled: excludeId !== undefined,
  });

  return (
    <ProductDetailCarouselSection
      recentlyViewedItems={recentlyViewedItems}
      recommendedItems={recommendedItems}
    />
  );
}
