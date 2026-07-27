import { useEffect, useState } from 'react';
import type React from 'react';

import { useTranslations } from 'next-intl';

import { PRODUCT_REVIEW_PER_PAGE } from '@entities/review/model/constants';
import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import { useProductReviews } from '@entities/review/queries/useProductReviews';

import { cn } from '@shared/lib/utils/style';
import Pagination from '@shared/ui/Pagination/Pagination';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import NoReviewProduct from './content/NoReviewProduct';
import ReviewContent from './content/ReviewContent';
import { ReviewContentListSkeleton } from './content/ReviewContentList';
import ReviewGalleryPreviewSection from './gallery/ReviewGalleryPreviewSection';
import ProductReviewHeader from './summary/ProductReviewHeader';

type ProductDetailReviewSectionProps = {
  detail: string;
  currentPath: string;
  reviewContentTopRef: React.RefObject<HTMLDivElement | null>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  reviewSortOption: ProductReviewSortOption;
  reviewFilter: ProductReviewFilter;
  onReviewSortChange: (nextSort: ProductReviewSortOption) => void;
  onReviewFilterChange: (nextFilter: ProductReviewFilter) => void;
};

type ReviewLoadErrorNoticeProps = {
  hasPreviousReviews: boolean;
  onRetry: () => void;
};

export default function ProductDetailReviewSection({
  detail,
  currentPath,
  reviewContentTopRef,
  currentPage,
  setCurrentPage,
  reviewSortOption,
  reviewFilter,
  onReviewSortChange,
  onReviewFilterChange,
}: ProductDetailReviewSectionProps) {
  const {
    data: productReviews,
    isPending,
    isFetching: isReviewsFetching,
    isPlaceholderData,
    isError,
    refetch,
  } = useProductReviews(detail, currentPage, reviewSortOption, reviewFilter);
  const [settledReviewControls, setSettledReviewControls] = useState(() => ({
    currentPage,
    reviewSortOption,
    reviewFilter,
  }));

  const totalReviews = productReviews?.summaryTotalItems ?? 0;
  const filteredTotalReviews = productReviews?.totalItems ?? 0;
  const averageRating = productReviews?.averageRating ?? 0;
  const ratingCounts = productReviews?.ratingCounts ?? [0, 0, 0, 0, 0];
  const hasNoReviews = totalReviews === 0;
  const hasReviewData = !!productReviews;
  const isInitialLoading = isPending && !hasReviewData;
  const hasReviewControlsChanged =
    settledReviewControls.currentPage !== currentPage ||
    settledReviewControls.reviewSortOption !== reviewSortOption ||
    settledReviewControls.reviewFilter !== reviewFilter;
  const isReviewTransitionPending =
    isReviewsFetching && isPlaceholderData && hasReviewControlsChanged;
  const isReviewsRefreshing = isReviewTransitionPending || isError;
  const isReviewContentDimmed = isReviewTransitionPending || isError;

  useEffect(() => {
    if (isReviewsFetching || isPlaceholderData || isError || !productReviews) {
      return;
    }

    setSettledReviewControls((previous) => {
      if (
        previous.currentPage === currentPage &&
        previous.reviewSortOption === reviewSortOption &&
        previous.reviewFilter === reviewFilter
      ) {
        return previous;
      }

      return {
        currentPage,
        reviewSortOption,
        reviewFilter,
      };
    });
  }, [
    currentPage,
    isError,
    isPlaceholderData,
    isReviewsFetching,
    productReviews,
    reviewFilter,
    reviewSortOption,
  ]);

  return (
    <PageWrapper>
      <div className="mb-10">
        <ProductReviewHeader
          totalReviews={totalReviews}
          averageRating={averageRating}
          ratingCounts={ratingCounts}
          isLoading={isInitialLoading}
        />

        {isInitialLoading ? (
          <ReviewContentLoadingFallback />
        ) : !hasReviewData ? (
          <ReviewLoadErrorNotice
            hasPreviousReviews={false}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : hasNoReviews ? (
          <div className="mt-6">
            <NoReviewProduct />
          </div>
        ) : (
          <div ref={reviewContentTopRef} className="relative mt-6">
            <div
              className={cn(
                'transition-opacity duration-200',
                isReviewContentDimmed ? 'opacity-50' : 'opacity-100',
              )}
            >
              <ReviewContent
                detail={detail}
                currentPath={currentPath}
                productReview={productReviews}
                currentPage={currentPage}
                sortOption={reviewSortOption}
                reviewFilter={reviewFilter}
                onSortChange={onReviewSortChange}
                onFilterChange={onReviewFilterChange}
                isSorting={isReviewTransitionPending}
                isRefreshing={isReviewsRefreshing}
                isLoading={false}
              />
              <nav
                className={cn(
                  'transition-opacity duration-200',
                  isReviewsRefreshing ? 'opacity-60' : 'opacity-100',
                )}
              >
                <div className="mx-auto mt-4 mb-8 flex max-w-7xl justify-center text-center">
                  <Pagination
                    totalItems={filteredTotalReviews}
                    itemsPerPage={PRODUCT_REVIEW_PER_PAGE}
                    scrollRef={reviewContentTopRef}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    disabled={isReviewsRefreshing}
                  />
                </div>
              </nav>
            </div>

            {isError ? (
              <ReviewLoadErrorNotice
                hasPreviousReviews
                onRetry={() => {
                  void refetch();
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function ReviewContentLoadingFallback() {
  return (
    <div className="mt-6">
      <ReviewGalleryPreviewSection
        totalReviewImageCount={0}
        hasLocalGalleryItems={false}
        previewGalleryItems={[]}
        hiddenGalleryCount={0}
        shouldShowGallerySkeleton
        onOpenGalleryModal={() => {}}
      />

      <section className="mt-10 rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5 dark:border-dark-border dark:bg-dark-panel">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="h-10 w-22 animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
            <div className="h-10 w-42 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
          </div>
          <div className="h-4 w-37.5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
        </div>
      </section>

      <div className="mt-8 min-h-60 md:min-h-80">
        <div className="columns-1 gap-6 md:columns-2 [column-fill:balance]">
          <ReviewContentListSkeleton />
        </div>
      </div>

      <div className="mx-auto mt-4 mb-8 flex max-w-7xl justify-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`review-content-pagination-loading-${index}`}
            className="h-10 w-10 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border"
          />
        ))}
      </div>
    </div>
  );
}

function ReviewLoadErrorNotice({
  hasPreviousReviews,
  onRetry,
}: ReviewLoadErrorNoticeProps) {
  const t = useTranslations('ProductReview.errors');

  return (
    <QueryErrorFallback
      title={t('loadFailed')}
      onRetry={onRetry}
      className={cn(
        'bg-surface/95 px-5 py-5 backdrop-blur-sm dark:bg-dark-panel/95',
        hasPreviousReviews
          ? 'absolute inset-x-4 top-1/2 z-20 -translate-y-1/2 sm:inset-x-10'
          : 'mt-6',
      )}
    />
  );
}
