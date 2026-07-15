'use client';
import { useEffect, useState } from 'react';

import { useSearchParams } from 'next/navigation';

import {
  IconAlertCircleFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { fetchApi } from '@shared/api/fetchApi';
import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';
import { getApiErrorMessage } from '@shared/lib/errors/apiErrorMessage';
import { useRouter } from '@shared/lib/i18n/navigation';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

type Status = 'idle' | 'confirming' | 'done' | 'error';

export default function TossSuccessContainer() {
  const t = useTranslations('Payment.tossSuccess');
  const tApiError = useTranslations('Common.apiErrors');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const paymentKey = params.get('paymentKey');
  const orderId = params.get('orderId');
  const amount = Number(params.get('amount'));
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');
  const content =
    status === 'confirming' || status === 'idle'
      ? {
          title: t('confirming.title'),
          description: t('confirming.description'),
        }
      : status === 'done'
        ? {
            title: t('done.title'),
            description: t('done.description'),
          }
        : {
            title: t('error.title'),
            description: message || t('error.description'),
          };

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setMessage(t('error.invalidResponse'));
      return;
    }

    const confirmPayment = async () => {
      try {
        setStatus('confirming');
        await fetchApi('/api/payments/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });

        setStatus('done');
        window.sessionStorage.removeItem(CHECKOUT_ENTRY_STORAGE_KEY);
        window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY);
        router.replace('/my/orders');
      } catch (error) {
        setStatus('error');
        setMessage(
          getApiErrorMessage(error, tApiError, t('error.processFailed')),
        );
      }
    };

    void confirmPayment();
  }, [amount, orderId, paymentKey, router, t, tApiError]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <div className="mx-auto mb-6 flex justify-center">
          {(status === 'confirming' || status === 'idle') && (
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-blue-900/30 dark:text-blue-300">
                <Spinner size="lg" variant="current" className="size-8.5" />
              </span>
            </div>
          )}

          {status === 'done' && (
            <span className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-success-soft text-success dark:bg-emerald-900/20">
              <IconCircleCheckFilled size={40} />
            </span>
          )}

          {status === 'error' && (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-danger">
              <IconAlertCircleFilled size={40} />
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          {content.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          {content.description}
        </p>

        {status === 'error' && (
          <button
            type="button"
            className="mt-7 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
            onClick={() => router.replace('/checkout')}
          >
            {t('backToCheckout')}
          </button>
        )}
      </div>
    </section>
  );
}
