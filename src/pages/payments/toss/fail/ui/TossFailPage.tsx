import { Suspense } from 'react';

import TossFailContainer from './TossFailContainer';

export default function TossFailPage() {
  return (
    <Suspense fallback={<TossFailFallback />}>
      <TossFailContainer />
    </Suspense>
  );
}

function TossFailFallback() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16 dark:bg-dark-bg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-lg dark:border-dark-border dark:bg-dark-bg">
        <h1 className="text-2xl font-bold text-ink dark:text-surface">
          결제에 실패했습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
          결제 오류 정보를 불러오는 중입니다.
        </p>
      </div>
    </section>
  );
}
