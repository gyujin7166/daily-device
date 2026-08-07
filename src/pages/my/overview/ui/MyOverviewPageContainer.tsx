'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import { MyPageOverviewSkeleton } from '@features/my/ui/skeletons';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyOverviewContent from './MyOverviewContent';

import type { Session } from 'next-auth';

type MyOverviewPageContainerProps = {
  session: Session;
};

export default function MyOverviewPageContainer({
  session,
}: MyOverviewPageContainerProps) {
  const t = useTranslations('MyOverview.page');
  const overviewFallback = (
    <MyPageOverviewSkeleton menuButton={<MyPageMobileMenuButton />} />
  );

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
