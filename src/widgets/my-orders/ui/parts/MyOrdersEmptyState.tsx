import { IconShoppingBagX } from '@tabler/icons-react';

type MyOrdersEmptyStateProps = {
  isReviewWriteMode: boolean;
  isReviewWrittenMode: boolean;
};

export default function MyOrdersEmptyState({
  isReviewWriteMode,
  isReviewWrittenMode,
}: MyOrdersEmptyStateProps) {
  return (
    <div className="flex min-h-140 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-6 py-10 text-center shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <IconShoppingBagX className="text-muted dark:text-dark-muted" size={42} />
      <h3 className="mt-4 text-xl font-semibold text-ink dark:text-surface">
        {isReviewWriteMode
          ? '상품평 작성 가능한 상품이 없습니다'
          : isReviewWrittenMode
            ? '작성한 상품평이 없습니다'
            : '주문 내역이 없습니다'}
      </h3>
      <p className="mt-2 text-sm text-muted dark:text-dark-muted">
        {isReviewWriteMode
          ? '배송 완료된 주문 중 아직 상품평을 작성할 항목이 없습니다.'
          : isReviewWrittenMode
            ? '상품평 작성 후 이 탭에서 수정할 수 있습니다.'
            : '아직 주문하신 상품이 없습니다.'}
      </p>
    </div>
  );
}
