'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';

import useProductDetailPageState from '@features/product-detail/model/hooks/useProductDetailPageState';
import {
  ProductCarouselSectionSkeleton,
  ProductDetailTopSection,
} from '@features/product-detail/ui';
import { ProductDetailReviewSection } from '@features/product-review/ui';

import { useProductDescription } from '@entities/product/queries/useProductDescription';
import { useProductImages } from '@entities/product/queries/useProductImages';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import ProductDetailRecommendedSectionSuspense from './ProductDetailRecommendedSectionSuspense';

type ProductDetailPageContainerProps = {
  category: string;
  detail: string;
  currentPath: string;
};

export default function ProductDetailPageContainer({
  category,
  detail,
  currentPath,
}: ProductDetailPageContainerProps) {
  const { data: productDetailData, isPending } = useProductDescription(detail);
  const { data: productImages } = useProductImages(detail);
  const {
    carouselColumnRef,
    reviewContentTopRef,
    carouselBaseHeight,
    currentPage,
    setCurrentPage,
    reviewSortOption,
    reviewFilter,
    handleReviewSortChange,
    handleReviewFilterChange,
    visibleRecentlyViewed,
  } = useProductDetailPageState({
    product: productDetailData?.product ?? null,
    mainImageUrl: productImages?.[0]?.image_url,
    productImages,
    currentPath,
  });

  return (
    <div className="bg-canvas dark:bg-dark-bg">
      <div className="pt-18 sm:pt-22.5">
        <ProductDetailTopSection
          detail={detail}
          isPending={isPending}
          carouselColumnRef={carouselColumnRef}
          carouselBaseHeight={carouselBaseHeight}
        />
        <ProductDetailReviewSection
          detail={detail}
          currentPath={currentPath}
          reviewContentTopRef={reviewContentTopRef}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          reviewSortOption={reviewSortOption}
          reviewFilter={reviewFilter}
          onReviewSortChange={handleReviewSortChange}
          onReviewFilterChange={handleReviewFilterChange}
        />
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              onReset={reset}
              fallback={({ reset: resetErrorBoundary }) => (
                <section className="px-4 pt-2 sm:px-6 lg:px-10">
                  <QueryErrorFallback
                    title="추천 상품을 불러오지 못했습니다."
                    onRetry={resetErrorBoundary}
                    className="mx-auto max-w-7xl"
                  />
                </section>
              )}
            >
              <Suspense fallback={<ProductDetailRecommendedSectionFallback />}>
                <ProductDetailRecommendedSectionSuspense
                  category={category}
                  excludeId={productDetailData?.product?.id}
                  recentlyViewedItems={visibleRecentlyViewed}
                />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </div>
  );
}

function ProductDetailRecommendedSectionFallback() {
  return (
    <section className="pt-2">
      <ProductCarouselSectionSkeleton eyebrow="RECOMMENDED" title="추천 상품" />
    </section>
  );
}
