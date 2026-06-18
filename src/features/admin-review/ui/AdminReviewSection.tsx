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

const getReviewStatusMessage = (review: AdminReview, hidden: boolean) =>
  `상품평 ${hidden ? '숨김 처리' : '복원'} 완료: ID ${review.id} / 상품명 ${getReviewProductName(review)}`;

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
  onError: (message: string) => void;
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
        getReviewStatusMessage(
          updatedReview,
          Boolean(updatedReview.adminHiddenAt),
        ),
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : '상품평 상태 변경 실패');
    }
  };

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        상품평 데이터를 불러오고 있습니다.
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
