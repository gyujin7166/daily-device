import { Suspense } from 'react';

import { getTranslations } from 'next-intl/server';

import TossSuccessContainer from './TossSuccessContainer';

export default async function TossSuccessPage() {
  const t = await getTranslations('Payment.tossSuccess.confirming');

  return (
    <Suspense
      fallback={
        <TossSuccessFallback
          title={t('title')}
          description={t('description')}
        />
      }
    >
      <TossSuccessContainer />
    </Suspense>
  );
}

function TossSuccessFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          {description}
        </p>
      </div>
    </section>
  );
}
