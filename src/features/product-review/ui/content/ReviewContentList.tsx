import type { ProductReviewListItem } from '@entities/review/model/types';

import { cn } from '@shared/lib/utils/style';

import ReviewContentItemCard from './ReviewContentItemCard';

import type { ReviewContentCardImage } from '../../model/reviewContent';

type ReviewContentListProps = {
  reviews: ProductReviewListItem[];
  isRefreshing: boolean;
  shouldShowSkeleton: boolean;
  getReviewImages: (reviewId: number) => ReviewContentCardImage[];
  isFeedbackPendingForReview: (reviewId: number) => boolean;
  onFeedbackClick: (productReviewId: number) => void;
  onOpenImageDetail: (
    reviewImages: ReviewContentCardImage[],
    imageIndex: number,
  ) => void;
  emptyMessage?: string;
};

export function ReviewContentListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <article
          key={`review-skeleton-${index}`}
          className="mb-6 break-inside-avoid rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((__, starIdx) => (
              <div
                key={`review-skeleton-star-${starIdx}`}
                className="h-3.5 w-3.5 animate-pulse rounded-xs bg-line dark:bg-dark-border"
              />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-4 w-5/6 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
          <div className="mt-6 flex gap-3 overflow-hidden sm:gap-4">
            {Array.from({ length: 2 }).map((__, imageIdx) => (
              <div
                key={`review-skeleton-image-${imageIdx}`}
                className="aspect-square w-25 shrink-0 animate-pulse rounded-2xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border sm:w-28"
              />
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-canvas px-3 py-3 dark:bg-dark-bg-hover">
            <div className="flex items-center justify-between">
              <div className="h-3 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="h-10 w-17 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

export default function ReviewContentList({
  reviews,
  isRefreshing,
  shouldShowSkeleton,
  getReviewImages,
  isFeedbackPendingForReview,
  onFeedbackClick,
  onOpenImageDetail,
  emptyMessage,
}: ReviewContentListProps) {
  return (
    <div
      className={cn(
        'mt-8 min-h-60 transition-opacity duration-200 md:min-h-80',
        isRefreshing ? 'opacity-60' : 'opacity-100',
      )}
    >
      <div className="columns-1 gap-6 md:columns-2 [column-fill:balance]">
        {shouldShowSkeleton ? (
          <ReviewContentListSkeleton />
        ) : reviews.length === 0 ? (
          <div className="break-inside-avoid rounded-2xl border border-line bg-surface px-5 py-10 text-center text-sm font-medium text-muted sm:px-6 dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted">
            {emptyMessage}
          </div>
        ) : (
          reviews.map((item) => (
            <ReviewContentItemCard
              key={item.id}
              item={item}
              reviewImages={getReviewImages(item.id)}
              isRefreshing={isRefreshing}
              isFeedbackPending={isFeedbackPendingForReview(item.id)}
              onFeedbackClick={onFeedbackClick}
              onOpenImageDetail={onOpenImageDetail}
            />
          ))
        )}
      </div>
    </div>
  );
}
