'use client';

import { useProductReviews } from '@entities/review/queries/useProductReviews';

import ProductDetailRatingSection from './ProductDetailRatingSection';

type ProductDetailRatingSummaryProps = {
  detail: string;
};

export default function ProductDetailRatingSummary({
  detail,
}: ProductDetailRatingSummaryProps) {
  const {
    data: productReviews,
    isPending,
    isError,
    error,
  } = useProductReviews(detail, 1, 'latest');

  if (isError) {
    throw error;
  }

  return (
    <ProductDetailRatingSection
      reviewCount={productReviews?.summaryTotalItems ?? 0}
      averageRating={productReviews?.averageRating ?? 0}
      isReviewSummaryLoading={isPending && !productReviews}
    />
  );
}
