'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyWishlistSkeleton from '@features/my/ui/skeletons/MyWishlistSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyWishlistContent from './MyWishlistContent';

export default function MyWishlistContainer() {
  const { status } = useSession();
  const wishlistFallback = (
    <MyWishlistSkeleton menuButton={<MyPageMobileMenuButton />} />
  );

  if (status === 'loading') {
    return wishlistFallback;
  }

  if (status !== 'authenticated') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-muted dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted">
        로그인 후 찜 목록을 확인할 수 있습니다.
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
              title="찜 목록을 불러오지 못했습니다."
              onRetry={resetErrorBoundary}
            />
          )}
        >
          <Suspense fallback={wishlistFallback}>
            <MyWishlistContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
