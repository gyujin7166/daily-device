'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyPageOrdersSkeleton from '@features/my/ui/skeletons/MyPageOrdersSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyOrdersContent from './MyOrdersContent';

import type { MyOrdersContentProps } from './MyOrdersContent';

type MyOrdersContainerProps = MyOrdersContentProps;

export function MyOrdersContainer({
  embedded = false,
  mode = 'all',
}: MyOrdersContainerProps) {
  const { status } = useSession();

  const isReviewWriteMode = mode === 'review';
  const isReviewWrittenMode = mode === 'review-written';
  const pageLabel = isReviewWriteMode
    ? 'WRITE REVIEW'
    : isReviewWrittenMode
      ? 'REVIEWS'
      : 'ORDERS';
  const pageTitle = isReviewWriteMode
    ? '상품평 작성'
    : isReviewWrittenMode
      ? '작성한 상품평'
      : '주문 목록';
  const pageDescription = isReviewWriteMode
    ? '배송 완료된 주문 중 아직 상품평을 작성하지 않은 항목입니다.'
    : isReviewWrittenMode
      ? '이미 작성한 상품평을 이곳에서 수정할 수 있습니다.'
      : '최근 주문 내역을 확인하세요.';
  const pageClassName = embedded
    ? 'w-full rounded-2xl lg:pl-4'
    : 'mx-auto w-full max-w-7xl px-4 pb-16 pt-27.5 sm:px-6';
  const ordersFallback = (
    <MyPageOrdersSkeleton
      pageClassName={pageClassName}
      pageLabel={pageLabel}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      menuButton={embedded ? <MyPageMobileMenuButton /> : undefined}
    />
  );

  if (status === 'loading') {
    return ordersFallback;
  }

  if (status !== 'authenticated') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-muted dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
        로그인 후 주문 정보를 확인할 수 있습니다.
      </div>
    );
  }

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ reset: resetErrorBoundary }) => (
            <QueryErrorFallback
              title={`${pageTitle} 정보를 불러오지 못했습니다.`}
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={ordersFallback}>
            <MyOrdersContent embedded={embedded} mode={mode} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
