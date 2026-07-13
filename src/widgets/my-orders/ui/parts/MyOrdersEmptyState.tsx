'use client';


import { useTranslations } from 'next-intl';

import MyPageEmptyRecommendedProducts from '@widgets/my-page-empty/ui/MyPageEmptyRecommendedProducts';
import MyPageEmptyStatePanel from '@widgets/my-page-empty/ui/MyPageEmptyStatePanel';

import { Link } from '@shared/lib/i18n/navigation';

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
  const t = useTranslations('MyOrders.empty');

  if (isReviewWriteMode) {
    return (
      <MyPageEmptyStatePanel
        title={t('reviewWrite.title')}
        description={t('reviewWrite.description')}
        iconVariant="write-review"
        action={
          <Link href="/my/orders" className={emptyActionClassName}>
            {t('reviewWrite.action')}
          </Link>
        }
      />
    );
  }

  if (isReviewWrittenMode) {
    return (
      <MyPageEmptyStatePanel
        title={t('reviewWritten.title')}
        description={t('reviewWritten.description')}
        iconVariant="reviews"
        action={
          <Link href="/products" className={emptyActionClassName}>
            {t('reviewWritten.action')}
          </Link>
        }
      />
    );
  }

  return (
    <>
      <MyPageEmptyStatePanel
        title={t('all.title')}
        description={t('all.description')}
        iconVariant="orders"
        layout="horizontal"
        action={
          <Link href="/products/discounts" className={emptyActionClassName}>
            {t('all.action')}
          </Link>
        }
      />
      <div className="mt-4">
        <MyPageEmptyRecommendedProducts />
      </div>
    </>
  );
}
