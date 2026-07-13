
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { useRouter } from '@shared/lib/i18n/navigation';
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
  const t = useTranslations('ProductReview.feedback');
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
      toast.info(t('loginRequired'));
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
