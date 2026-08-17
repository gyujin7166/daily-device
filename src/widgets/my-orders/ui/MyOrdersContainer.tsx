'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyPageOrdersSkeleton from '@features/my/ui/skeletons/MyPageOrdersSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyOrdersContent from './MyOrdersContent';

import type { MyOrdersContentProps } from './MyOrdersContent';

type MyOrdersContainerProps = MyOrdersContentProps;

export function MyOrdersContainer({ mode = 'all' }: MyOrdersContainerProps) {
  const t = useTranslations('MyOrders');

  const isReviewWriteMode = mode === 'review';
  const isReviewWrittenMode = mode === 'review-written';
  const pageLabel = isReviewWriteMode
    ? t('meta.reviewWrite.label')
    : isReviewWrittenMode
      ? t('meta.reviewWritten.label')
      : t('meta.all.label');
  const pageTitle = isReviewWriteMode
    ? t('meta.reviewWrite.title')
    : isReviewWrittenMode
      ? t('meta.reviewWritten.title')
      : t('meta.all.title');
  const pageDescription = isReviewWriteMode
    ? t('meta.reviewWrite.description')
    : isReviewWrittenMode
      ? t('meta.reviewWritten.description')
      : t('meta.all.description');
  const pageClassName = 'w-full rounded-2xl lg:pl-4';
  const ordersFallback = (
    <MyPageOrdersSkeleton
      pageClassName={pageClassName}
      pageLabel={pageLabel}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      menuButton={<MyPageMobileMenuButton />}
    />
  );

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ reset: resetErrorBoundary }) => (
            <QueryErrorFallback
              title={t('loadFailed', { title: pageTitle })}
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={ordersFallback}>
            <MyOrdersContent mode={mode} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
