'use client';
import { useSearchParams } from 'next/navigation';

import { IconAlertCircleFilled } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useRouter } from '@shared/lib/i18n/navigation';

export default function TossFailContainer() {
  const t = useTranslations('Payment.tossFail');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const errorCode = params.get('code');
  const errorMessage = params.get('message');

  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <div className="mx-auto mb-6 flex justify-center">
          <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-danger/10 text-danger">
            <IconAlertCircleFilled size={40} />
          </span>
        </div>

        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          {t('title')}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          {t('description')}
        </p>

        <div className="mt-6 rounded-xl border border-line bg-canvas p-4 text-left dark:border-dark-border dark:bg-dark-bg">
          <p className="text-xs text-muted dark:text-dark-muted">
            {t('errorCode')}{' '}
            <span className="font-semibold text-ink dark:text-surface">
              {errorCode || 'N/A'}
            </span>
          </p>
          <p className="mt-2 break-words text-xs text-muted dark:text-dark-muted">
            {t('errorMessage')}{' '}
            <span className="font-semibold text-ink dark:text-surface">
              {errorMessage || 'No message'}
            </span>
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
            onClick={() => router.replace('/checkout')}
          >
            {t('backToCheckout')}
          </button>
        </div>
      </div>
    </section>
  );
}
