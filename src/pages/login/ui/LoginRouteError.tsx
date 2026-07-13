'use client';
import { useTranslations } from 'next-intl';

import QueryErrorFallback from '@shared/ui/QueryErrorFallback';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

export default function LoginRouteError() {
  const t = useTranslations('RouteError');

  return (
    <main className="min-h-screen bg-canvas dark:bg-dark-bg">
      <PageWrapper className="pt-26 pb-16 sm:pt-30">
        <QueryErrorFallback
          title={t('title')}
          description={t('description')}
          onRetry={() => {
            window.location.reload();
          }}
        />
      </PageWrapper>
    </main>
  );
}
