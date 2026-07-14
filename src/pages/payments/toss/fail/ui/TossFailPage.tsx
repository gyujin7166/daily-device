import { Suspense } from 'react';

import { getTranslations } from 'next-intl/server';

import TossFailContainer from './TossFailContainer';

export default async function TossFailPage() {
  const t = await getTranslations('Payment.tossFail');

  return (
    <Suspense fallback={<TossFailFallback title={t('title')} loading={t('loading')} />}>
      <TossFailContainer />
    </Suspense>
  );
}

function TossFailFallback({
  title,
  loading,
}: {
  title: string;
  loading: string;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          {loading}
        </p>
      </div>
    </section>
  );
}
