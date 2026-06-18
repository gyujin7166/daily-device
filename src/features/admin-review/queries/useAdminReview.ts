import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getAdminReviews, toggleAdminReviewHidden } from '../api/adminReview';

import type { AdminReview, AdminReviewListParams } from '../model/types';

export const adminReviewQueryKeys = {
  all: ['admin', 'reviews'] as const,
  list: (params: AdminReviewListParams) =>
    [...adminReviewQueryKeys.all, params] as const,
};

export const useAdminReviewsQuery = (
  params: AdminReviewListParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: adminReviewQueryKeys.list(params),
    queryFn: () => getAdminReviews(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useToggleAdminReviewHiddenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: AdminReview) => toggleAdminReviewHidden(review),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminReviewQueryKeys.all,
      });
    },
  });
};
