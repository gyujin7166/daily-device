import { adminFetch } from '@shared/api/adminApi';

import type {
  AdminReview,
  AdminReviewListParams,
  AdminReviewPayload,
} from '../model/types';

export const getAdminReviews = (params: AdminReviewListParams) => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    status: params.status,
  });

  if (params.keyword.trim()) {
    searchParams.set('keyword', params.keyword.trim());
  }

  return adminFetch<AdminReviewPayload>(
    `/api/admin/reviews?${searchParams.toString()}`,
  );
};

export const toggleAdminReviewHidden = (review: AdminReview) =>
  adminFetch<AdminReview>(`/api/admin/reviews/${review.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ hidden: !review.adminHiddenAt }),
  });
