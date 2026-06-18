import type { ProductReviewGalleryPageResponse } from '@entities/review/model/types';
import type {
  ProductReviewFeedbackSummary,
  ProductReviewsPayload,
  UpsertProductReviewFeedbackVariables,
} from '@entities/review/model/types';

import type { InfiniteData, QueryKey } from '@tanstack/react-query';

export type ProductReviewsResponse = ProductReviewsPayload;

export type ProductReviewFeedbackMutationContext = {
  previousReviewQueries: Array<[QueryKey, ProductReviewsResponse | undefined]>;
  previousGalleryQueries: Array<
    [QueryKey, InfiniteData<ProductReviewGalleryPageResponse> | undefined]
  >;
};

const getNextFeedbackState = (
  helpfulCount: number,
  currentUserVote: boolean | null,
) => {
  // 현재 정책은 helpful 토글만 지원하므로 true를 다시 누르면 투표를 취소한다.
  const nextVote = currentUserVote === true ? null : true;
  const nextHelpfulCount =
    nextVote === true ? helpfulCount + 1 : Math.max(0, helpfulCount - 1);

  return {
    helpfulCount: nextHelpfulCount,
    currentUserVote: nextVote,
  };
};

export const applyOptimisticFeedback = (
  response: ProductReviewsResponse,
  variables: UpsertProductReviewFeedbackVariables,
) => ({
  ...response,
  items: response.items.map((item) => {
    if (item.id !== variables.productReviewId) {
      return item;
    }

    const nextFeedbackState = getNextFeedbackState(
      item.helpfulCount,
      item.currentUserVote,
    );

    return {
      ...item,
      helpfulCount: nextFeedbackState.helpfulCount,
      currentUserVote: nextFeedbackState.currentUserVote,
    };
  }),
});

export const applyOptimisticGalleryFeedback = (
  response: InfiniteData<ProductReviewGalleryPageResponse>,
  variables: UpsertProductReviewFeedbackVariables,
): InfiniteData<ProductReviewGalleryPageResponse> => ({
  ...response,
  // 갤러리는 infinite query라 모든 page의 중첩 productReview를 함께 갱신한다.
  pages: response.pages.map((page) => ({
    ...page,
    items: page.items.map((item) => {
      if (item.productReview.id !== variables.productReviewId) {
        return item;
      }

      const nextFeedbackState = getNextFeedbackState(
        item.productReview.helpfulCount,
        item.productReview.currentUserVote,
      );

      return {
        ...item,
        productReview: {
          ...item.productReview,
          helpfulCount: nextFeedbackState.helpfulCount,
          currentUserVote: nextFeedbackState.currentUserVote,
        },
      };
    }),
  })),
});

export const applyServerFeedback = (
  response: ProductReviewsResponse,
  summary: ProductReviewFeedbackSummary,
) => ({
  ...response,
  items: response.items.map((item) =>
    item.id === summary.productReviewId
      ? {
          ...item,
          helpfulCount: summary.helpfulCount,
          currentUserVote: summary.currentUserVote,
        }
      : item,
  ),
});

export const applyServerGalleryFeedback = (
  response: InfiniteData<ProductReviewGalleryPageResponse>,
  summary: ProductReviewFeedbackSummary,
): InfiniteData<ProductReviewGalleryPageResponse> => ({
  ...response,
  pages: response.pages.map((page) => ({
    ...page,
    items: page.items.map((item) =>
      item.productReview.id === summary.productReviewId
        ? {
            ...item,
            productReview: {
              ...item.productReview,
              helpfulCount: summary.helpfulCount,
              currentUserVote: summary.currentUserVote,
            },
          }
        : item,
    ),
  })),
});
