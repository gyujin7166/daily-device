'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('MyOrders');
  const { status } = useSession();

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
        {t('authRequired')}
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
              title={t('loadFailed', { title: pageTitle })}
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
