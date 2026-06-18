'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyAddressSkeleton from '@features/my/ui/skeletons/MyAddressSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyAddressContent from './MyAddressContent';

export default function MyAddressContainer() {
  const { status } = useSession();
  const addressFallback = (
    <MyAddressSkeleton menuButton={<MyPageMobileMenuButton />} />
  );

  if (status === 'loading') {
    return addressFallback;
  }

  if (status !== 'authenticated') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-muted dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
        로그인 후 배송지 정보를 확인할 수 있습니다.
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
              title="배송지 정보를 불러오지 못했습니다."
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={addressFallback}>
            <MyAddressContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
