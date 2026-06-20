'use client';

import Link from 'next/link';

import MyPageEmptyRecommendedProducts from '@widgets/my-page-empty/ui/MyPageEmptyRecommendedProducts';
import MyPageEmptyStatePanel from '@widgets/my-page-empty/ui/MyPageEmptyStatePanel';

type MyOrdersEmptyStateProps = {
  isReviewWriteMode: boolean;
  isReviewWrittenMode: boolean;
};

const emptyActionClassName =
  'inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-surface shadow-[0_14px_26px_-18px_rgba(37,99,235,0.75)] transition-colors hover:bg-primary-hover';

export default function MyOrdersEmptyState({
  isReviewWriteMode,
  isReviewWrittenMode,
}: MyOrdersEmptyStateProps) {
  if (isReviewWriteMode) {
    return (
      <MyPageEmptyStatePanel
        title="아직 남길 후기가 없어요"
        description="구매한 상품이 배송 완료되면 이곳에서 후기를 작성할 수 있습니다."
        iconVariant="write-review"
        action={
          <Link href="/my/orders" className={emptyActionClassName}>
            구매 내역 보기
          </Link>
        }
      />
    );
  }

  if (isReviewWrittenMode) {
    return (
      <MyPageEmptyStatePanel
        title="작성한 상품평이 없어요"
        description="구매한 상품의 사용 경험을 남기면 이곳에서 다시 확인할 수 있습니다."
        iconVariant="reviews"
        action={
          <Link href="/products" className={emptyActionClassName}>
            추천 상품 보기
          </Link>
        }
      />
    );
  }

  return (
    <>
      <MyPageEmptyStatePanel
        title="아직 주문이 없어요"
        description="마음에 드는 상품을 찾고 첫 주문을 시작해보세요."
        iconVariant="orders"
        layout="horizontal"
        action={
          <Link href="/products/discounts" className={emptyActionClassName}>
            오늘의 특가 보기
          </Link>
        }
      />
      <div className="mt-4">
        <MyPageEmptyRecommendedProducts />
      </div>
    </>
  );
}
