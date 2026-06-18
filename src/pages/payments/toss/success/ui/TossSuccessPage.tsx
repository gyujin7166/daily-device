import { Suspense } from 'react';

import TossSuccessContainer from './TossSuccessContainer';

export default function TossSuccessPage() {
  return (
    <Suspense fallback={<TossSuccessFallback />}>
      <TossSuccessContainer />
    </Suspense>
  );
}

function TossSuccessFallback() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          결제를 확인하고 있습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          결제 정보와 주문 정보를 동기화하는 중입니다. 잠시만 기다려주세요.
        </p>
      </div>
    </section>
  );
}
