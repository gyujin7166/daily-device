import { useMutation, useQueryClient } from '@tanstack/react-query';

import { upsertProductReviewFeedback } from '@entities/review/api/review';
import type { ProductReviewGalleryPageResponse } from '@entities/review/model/types';
import type {
  ProductReviewFeedbackSummary,
  UpsertProductReviewFeedbackVariables,
} from '@entities/review/model/types';
import { productReviewQueryKeys } from '@entities/review/queries/queryKeys';

import {
  applyOptimisticFeedback,
  applyOptimisticGalleryFeedback,
  applyServerFeedback,
  applyServerGalleryFeedback,
} from '../model/reviewFeedback';

import type {
  ProductReviewFeedbackMutationContext,
  ProductReviewsResponse,
} from '../model/reviewFeedback';
import type { InfiniteData } from '@tanstack/react-query';

export const useUpsertProductReviewFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ProductReviewFeedbackSummary,
    Error,
    UpsertProductReviewFeedbackVariables,
    ProductReviewFeedbackMutationContext
  >({
    mutationKey: productReviewQueryKeys.upsertReviewFeedbackMutation(),
    mutationFn: upsertProductReviewFeedback,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: productReviewQueryKeys.reviewsAll(),
      });
      await queryClient.cancelQueries({
        queryKey: productReviewQueryKeys.galleryAll(),
      });

      const previousReviewQueries =
        queryClient.getQueriesData<ProductReviewsResponse>({
          queryKey: productReviewQueryKeys.reviewsAll(),
        });
      const previousGalleryQueries = queryClient.getQueriesData<
        InfiniteData<ProductReviewGalleryPageResponse>
      >({
        queryKey: productReviewQueryKeys.galleryAll(),
      });

      queryClient.setQueriesData<ProductReviewsResponse>(
        { queryKey: productReviewQueryKeys.reviewsAll() },
        (current) =>
          current ? applyOptimisticFeedback(current, variables) : current,
      );
      queryClient.setQueriesData<
        InfiniteData<ProductReviewGalleryPageResponse>
      >({ queryKey: productReviewQueryKeys.galleryAll() }, (current) =>
        current ? applyOptimisticGalleryFeedback(current, variables) : current,
      );

      return { previousReviewQueries, previousGalleryQueries };
    },
    onError: (_error, _variables, context) => {
      context?.previousReviewQueries.forEach(([cacheKey, previousData]) => {
        queryClient.setQueryData(cacheKey, previousData);
      });
      context?.previousGalleryQueries.forEach(([cacheKey, previousData]) => {
        queryClient.setQueryData(cacheKey, previousData);
      });
    },
    onSuccess: (summary) => {
      queryClient.setQueriesData<ProductReviewsResponse>(
        { queryKey: productReviewQueryKeys.reviewsAll() },
        (current) =>
          current ? applyServerFeedback(current, summary) : current,
      );
      queryClient.setQueriesData<
        InfiniteData<ProductReviewGalleryPageResponse>
      >({ queryKey: productReviewQueryKeys.galleryAll() }, (current) =>
        current ? applyServerGalleryFeedback(current, summary) : current,
      );
    },
  });
};
