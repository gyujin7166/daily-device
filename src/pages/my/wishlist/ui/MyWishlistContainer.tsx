'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyWishlistSkeleton from '@features/my/ui/skeletons/MyWishlistSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyWishlistContent from './MyWishlistContent';

export default function MyWishlistContainer() {
  const t = useTranslations('MyWishlist.page');
  const wishlistFallback = (
    <MyWishlistSkeleton menuButton={<MyPageMobileMenuButton />} />
  );

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
