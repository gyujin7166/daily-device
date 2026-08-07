'use client';
import { Suspense } from 'react';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { MyPageMobileMenuButton } from '@features/my/ui';
import MyAddressSkeleton from '@features/my/ui/skeletons/MyAddressSkeleton';

import ErrorBoundary from '@shared/ui/ErrorBoundary';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';

import MyAddressContent from './MyAddressContent';

export default function MyAddressContainer() {
  const t = useTranslations('MyAddress.page');
  const addressFallback = (
    <MyAddressSkeleton menuButton={<MyPageMobileMenuButton />} />
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
          <Suspense fallback={addressFallback}>
            <MyAddressContent />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
