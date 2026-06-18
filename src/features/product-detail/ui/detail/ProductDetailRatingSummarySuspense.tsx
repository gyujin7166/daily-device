'use client';
import { useSuspenseProductReviews } from '@entities/review/queries/useProductReviews';

import ProductDetailRatingSection from './ProductDetailRatingSection';

type ProductDetailRatingSummarySuspenseProps = {
  detail: string;
};

export default function ProductDetailRatingSummarySuspense({
  detail,
}: ProductDetailRatingSummarySuspenseProps) {
  const { data: productReviews } = useSuspenseProductReviews(
    detail,
    1,
    'latest',
  );

  return (
    <ProductDetailRatingSection
      reviewCount={productReviews?.totalItems ?? 0}
      averageRating={productReviews?.averageRating ?? 0}
      isReviewSummaryLoading={false}
    />
  );
}
