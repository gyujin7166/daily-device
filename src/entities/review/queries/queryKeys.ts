import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';

export const productReviewQueryKeys = {
  all: ['productReviews'] as const,
  review: (orderItemId: number) =>
    [...productReviewQueryKeys.all, 'review', orderItemId] as const,
  reviewsAll: () => [...productReviewQueryKeys.all, 'reviews'] as const,
  reviews: (
    slug: string,
    page: number,
    sort: ProductReviewSortOption,
    filter: ProductReviewFilter,
    viewerKey: string,
    locale?: string,
  ) =>
    [
      ...productReviewQueryKeys.reviewsAll(),
      slug,
      page,
      sort,
      filter,
      viewerKey,
      locale,
    ] as const,
  galleryAll: () => [...productReviewQueryKeys.all, 'gallery'] as const,
  gallery: (
    slug: string,
    pageSize: number,
    viewerKey: string,
    locale?: string,
  ) =>
    [
      ...productReviewQueryKeys.galleryAll(),
      slug,
      pageSize,
      viewerKey,
      locale,
    ] as const,
  upsertReviewMutation: () =>
    [...productReviewQueryKeys.all, 'upsertReviewMutation'] as const,
  upsertReviewFeedbackMutation: () =>
    [...productReviewQueryKeys.all, 'upsertReviewFeedbackMutation'] as const,
};
