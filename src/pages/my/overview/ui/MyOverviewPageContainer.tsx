'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import { MyPageOverviewSkeleton } from '@features/my/ui/skeletons';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyOverviewContent from './MyOverviewContent';

export default function MyOverviewPageContainer() {
  const t = useTranslations('MyOverview.page');
  const { data: session, status } = useSession();
  const overviewFallback = (
    <MyPageOverviewSkeleton menuButton={<MyPageMobileMenuButton />} />
  );

  if (status === 'loading') {
    return overviewFallback;
  }

  if (status !== 'authenticated' || !session) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-muted dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
        {t('authRequired')}
      </div>
    );
  }

  return (
    // QueryErrorResetBoundary의 reset을 ErrorBoundary에 연결해 재시도 시 쿼리 에러 상태를 함께 초기화한다.
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ reset: resetErrorBoundary }) => (
            <QueryErrorFallback
              title={t('loadFailed')}
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={overviewFallback}>
            <MyOverviewContent session={session} />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
