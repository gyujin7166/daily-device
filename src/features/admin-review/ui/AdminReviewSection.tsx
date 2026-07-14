import { useTranslations } from 'next-intl';

import { useToggleAdminReviewHiddenMutation } from '../queries/useAdminReview';

import AdminReviewListSection from './AdminReviewListSection';

import type {
  AdminReview,
  AdminReviewListParams,
  AdminReviewPayload,
  AdminReviewStatus,
} from '../model/types';

const getReviewProductName = (review: AdminReview) =>
  review.product.name_ko || review.product.name_en || review.product.slug;

type AdminReviewSectionProps = {
  data?: AdminReviewPayload;
  isPending: boolean;
  isFetching: boolean;
  canWriteAdmin: boolean;
  params: AdminReviewListParams;
  onKeywordChange: (keyword: string) => void;
  onStatusChange: (status: AdminReviewStatus) => void;
  onPageChange: (page: number) => void;
  onMessage: (message: string) => void;
  onError: (error: unknown) => void;
  onReadOnlyAction: () => void;
};

export default function AdminReviewSection({
  data,
  isPending,
  isFetching,
  canWriteAdmin,
  params,
  onKeywordChange,
  onStatusChange,
  onPageChange,
  onMessage,
  onError,
  onReadOnlyAction,
}: AdminReviewSectionProps) {
  const t = useTranslations('AdminReview.feedback');
  const toggleReviewHiddenMutation = useToggleAdminReviewHiddenMutation();
  const reviewPage = data?.reviews;
  const reviews = reviewPage?.items ?? [];
  const isSaving = toggleReviewHiddenMutation.isPending;

  const toggleReviewHidden = async (review: AdminReview) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const updatedReview =
        await toggleReviewHiddenMutation.mutateAsync(review);
      onMessage(
        t('statusChanged', {
          action: updatedReview.adminHiddenAt
            ? t('hideAction')
            : t('restoreAction'),
          id: updatedReview.id,
          productName: getReviewProductName(updatedReview),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('statusChangeFailed'));
    }
  };

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        {t('loading')}
      </div>
    );
  }

  return (
    <AdminReviewListSection
      params={params}
      reviewPage={reviewPage}
      reviews={reviews}
      isFetching={isFetching}
      isSaving={isSaving}
      canWriteAdmin={canWriteAdmin}
      onKeywordChange={onKeywordChange}
      onStatusChange={onStatusChange}
      onPageChange={onPageChange}
      onToggleHidden={(review) => void toggleReviewHidden(review)}
    />
  );
}
