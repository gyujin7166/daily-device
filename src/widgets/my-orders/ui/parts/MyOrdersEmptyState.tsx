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
        title="상품평을 작성할 상품이 없어요"
        description="배송 완료된 주문 중 아직 상품평을 작성할 항목이 없습니다."
        iconVariant="write-review"
        action={
          <Link href="/my/orders" className={emptyActionClassName}>
            주문 목록 보기
          </Link>
        }
      />
    );
  }

  if (isReviewWrittenMode) {
    return (
      <MyPageEmptyStatePanel
        title="작성한 상품평이 없어요"
        description="상품을 구매하고 사용 경험을 상품평으로 남겨보세요."
        iconVariant="reviews"
        action={
          <Link href="/products" className={emptyActionClassName}>
            상품 둘러보기
          </Link>
        }
      />
    );
  }

  return (
    <MyPageEmptyStatePanel
      title="아직 주문한 내역이 없어요"
      description="마음에 드는 상품을 둘러보고 첫 주문을 시작해보세요."
      iconVariant="orders"
      action={
        <Link href="/products" className={emptyActionClassName}>
          쇼핑하러 가기
        </Link>
      }
    >
      <MyPageEmptyRecommendedProducts />
    </MyPageEmptyStatePanel>
  );
}
