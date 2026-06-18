import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { toast } from '@shared/lib/toast';

import { useUpsertProductReviewFeedback } from '../../queries/useUpsertProductReviewFeedback';

type UseReviewGalleryFeedbackParams = {
  currentPath: string;
  selectedReviewId: number | null;
};

export default function useReviewGalleryFeedback({
  currentPath,
  selectedReviewId,
}: UseReviewGalleryFeedbackParams) {
  const router = useRouter();
  const { status } = useSession();
  const {
    mutate: upsertProductReviewFeedback,
    isPending: isProductReviewFeedbackPending,
    variables: productReviewFeedbackVariables,
  } = useUpsertProductReviewFeedback();

  const isFeedbackPendingForSelected =
    selectedReviewId !== null &&
    isProductReviewFeedbackPending &&
    productReviewFeedbackVariables?.productReviewId === selectedReviewId;

  const handleFeedbackClick = (productReviewId: number) => {
    if (status === 'loading') {
      return;
    }

    if (status !== 'authenticated') {
      toast.info('리뷰 도움 표시 기능은 로그인 후 사용할 수 있습니다.');
      router.push(getLoginRedirectPath(currentPath));
      return;
    }

    upsertProductReviewFeedback({ productReviewId });
  };

  const handleSelectedFeedbackClick = () => {
    if (selectedReviewId) {
      handleFeedbackClick(selectedReviewId);
    }
  };

  return {
    handleSelectedFeedbackClick,
    isFeedbackPendingForSelected,
  };
}
