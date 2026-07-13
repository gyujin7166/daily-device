'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyWishlistSkeleton from '@features/my/ui/skeletons/MyWishlistSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyWishlistContent from './MyWishlistContent';

export default function MyWishlistContainer() {
  const t = useTranslations('MyWishlist.page');
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
              title={t('loadFailed')}
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
