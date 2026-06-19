'use client';

import { useRecommendedProducts } from '@entities/product/queries/useRecommendedProducts';

import ProductDetailCarousel from '@widgets/product-recommendation/ui/ProductDetailCarousel';

type MyPageEmptyRecommendedProductsProps = {
  title?: string;
};

export default function MyPageEmptyRecommendedProducts({
  title = '이런 상품은 어떠세요?',
}: MyPageEmptyRecommendedProductsProps) {
  const { data: recommendedItems = [], isPending } = useRecommendedProducts({
    limit: 10,
  });

  if (isPending) {
    return (
      <div className="border-t border-line px-6 py-8 dark:border-dark-border sm:px-10 lg:px-14">
        <div className="h-5 w-44 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`my-page-empty-recommendation-skeleton-${index}`}
              className="h-72 animate-pulse rounded-3xl bg-canvas dark:bg-dark-bg-hover"
            />
          ))}
        </div>
      </div>
    );
  }

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-line pt-8 dark:border-dark-border">
      <ProductDetailCarousel
        items={recommendedItems}
        eyebrow="FOR YOU"
        title={title}
        density="compact"
        productBackgroundClassName="border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg"
      />
    </div>
  );
}
