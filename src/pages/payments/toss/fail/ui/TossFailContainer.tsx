'use client';
import { useRouter, useSearchParams } from 'next/navigation';

import { IconAlertCircleFilled } from '@tabler/icons-react';

export default function TossFailContainer() {
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
          결제에 실패했습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.
        </p>

        <div className="mt-6 rounded-xl border border-line bg-canvas p-4 text-left dark:border-dark-border dark:bg-dark-bg">
          <p className="text-xs text-muted dark:text-dark-muted">
            오류 코드:{' '}
            <span className="font-semibold text-ink dark:text-surface">
              {errorCode || 'N/A'}
            </span>
          </p>
          <p className="mt-2 break-words text-xs text-muted dark:text-dark-muted">
            오류 메시지:{' '}
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
            결제 화면으로 돌아가기
          </button>
        </div>
      </div>
    </section>
  );
}
