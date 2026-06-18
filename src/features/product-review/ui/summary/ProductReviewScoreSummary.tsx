import { ProductReviewScoreSkeleton } from './ProductReviewHeaderSkeleton';
import ProductReviewStars from './ProductReviewStars';

import type { ProductReviewSummary } from '../../model/reviewSummary';

type ProductReviewScoreSummaryProps = {
  displayRating: number;
  isLoading: boolean;
  summary: ProductReviewSummary;
};

export default function ProductReviewScoreSummary({
  displayRating,
  isLoading,
  summary,
}: ProductReviewScoreSummaryProps) {
  if (isLoading) {
    return <ProductReviewScoreSkeleton />;
  }

  return (
    <>
      <div className="flex items-end justify-center gap-2">
        <span className="text-7xl font-semibold leading-none text-ink sm:text-7xl lg:text-8xl dark:text-surface">
          {displayRating.toFixed(1)}
        </span>
        <span className="pb-2 text-3xl font-medium text-muted sm:text-4xl dark:text-dark-muted">
          /5
        </span>
      </div>
      <ProductReviewStars
        fullStarCount={summary.fullStarCount}
        hasHalfStar={summary.hasHalfStar}
        emptyStarCount={summary.emptyStarCount}
        hasReviews={summary.hasReviews}
      />
      <div className="mt-3 text-base font-medium text-muted dark:text-dark-muted">
        총 {summary.safeTotalReviews.toLocaleString('ko-KR')}개 리뷰 기준
      </div>
    </>
  );
}
