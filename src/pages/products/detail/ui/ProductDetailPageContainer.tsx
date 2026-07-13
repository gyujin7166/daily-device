'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import useProductDetailPageState from '@features/product-detail/model/hooks/useProductDetailPageState';
import { ProductDetailTopSection } from '@features/product-detail/ui';
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
  const t = useTranslations('Products.detail');
  const { data: productDetailData, isPending } = useProductDescription(detail);
  const isDetailInitialLoading = isPending && !productDetailData;
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
          isDetailInitialLoading={isDetailInitialLoading}
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
                    title={t('recommendedLoadFailed')}
                    onRetry={resetErrorBoundary}
                    className="mx-auto max-w-7xl"
                  />
                </section>
              )}
            >
              <ProductDetailRecommendedSectionSuspense
                category={category}
                excludeId={productDetailData?.product?.id}
                recentlyViewedItems={visibleRecentlyViewed}
              />
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </div>
    </div>
  );
}
