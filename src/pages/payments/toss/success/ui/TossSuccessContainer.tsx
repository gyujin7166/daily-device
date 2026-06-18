'use client';
import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  IconAlertCircleFilled,
  IconCircleCheckFilled,
  IconLoader2,
} from '@tabler/icons-react';

import { fetchApi } from '@shared/api/fetchApi';
import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';

type Status = 'idle' | 'confirming' | 'done' | 'error';

export default function TossSuccessContainer() {
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
          title: '결제를 확인하고 있습니다',
          description:
            '결제 정보와 주문 정보를 동기화하는 중입니다. 잠시만 기다려주세요.',
        }
      : status === 'done'
        ? {
            title: '결제가 완료되었습니다',
            description: '주문 목록 탭으로 이동하고 있습니다.',
          }
        : {
            title: '결제 확인에 실패했습니다',
            description: message || '결제 처리 중 문제가 발생했습니다.',
          };

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setMessage('유효하지 않은 결제 응답입니다.');
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
          error instanceof Error
            ? error.message
            : '결제 처리 중 오류가 발생했습니다.',
        );
      }
    };

    void confirmPayment();
  }, [amount, orderId, paymentKey, router]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <div className="mx-auto mb-6 flex justify-center">
          {(status === 'confirming' || status === 'idle') && (
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary dark:bg-blue-900/30 dark:text-blue-300">
                <IconLoader2 size={34} className="animate-spin" stroke={2.2} />
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
            결제 화면으로 돌아가기
          </button>
        )}
      </div>
    </section>
  );
}
