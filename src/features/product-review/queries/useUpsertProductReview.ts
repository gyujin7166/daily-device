import { useMutation, useQueryClient } from '@tanstack/react-query';

import { orderQueryKeys } from '@entities/order/queries/queryKeys';
import { upsertProductReview } from '@entities/review/api/review';
import { productReviewQueryKeys } from '@entities/review/queries/queryKeys';

export const useUpsertProductReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: productReviewQueryKeys.upsertReviewMutation(),
    mutationFn: upsertProductReview,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productReviewQueryKeys.reviewsAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: productReviewQueryKeys.galleryAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: productReviewQueryKeys.review(variables.orderItemId),
        }),
        queryClient.invalidateQueries({
          queryKey: orderQueryKeys.all,
        }),
      ]);
    },
  });
};
