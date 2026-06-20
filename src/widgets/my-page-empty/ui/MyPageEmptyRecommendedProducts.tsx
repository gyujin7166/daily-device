'use client';

import { useRecommendedProducts } from '@entities/product/queries/useRecommendedProducts';

import ProductDetailCarousel from '@widgets/product-recommendation/ui/ProductDetailCarousel';

type MyPageEmptyRecommendedProductsProps = {
  title?: string;
  context?: 'orders-empty' | 'wishlist-empty';
};

export default function MyPageEmptyRecommendedProducts({
  title = '이런 상품은 어떠세요?',
  context = 'orders-empty',
}: MyPageEmptyRecommendedProductsProps) {
  const { data: recommendedItems = [], isPending } = useRecommendedProducts({
    limit: 10,
    context,
  });

  if (isPending) {
    return (
      <section className="overflow-hidden rounded-2xl border border-line bg-surface px-5 pb-3 pt-6 shadow-xs dark:border-dark-border dark:bg-dark-panel sm:px-7">
        <div className="h-5 w-44 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`my-page-empty-recommendation-skeleton-${index}`}
              className="h-72 animate-pulse rounded-2xl bg-canvas dark:bg-dark-bg-hover"
            />
          ))}
        </div>
      </section>
    );
  }

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface py-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <ProductDetailCarousel
        items={recommendedItems}
        eyebrow="FOR YOU"
        title={title}
        density="compact"
        className="pb-0"
        productBackgroundClassName="border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg"
      />
    </section>
  );
}
