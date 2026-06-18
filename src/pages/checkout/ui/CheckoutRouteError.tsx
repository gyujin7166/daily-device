'use client';
import QueryErrorFallback from '@shared/ui/QueryErrorFallback';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

export default function CheckoutRouteError() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-canvas dark:bg-dark-bg">
      <PageWrapper className="pt-26 pb-16 sm:pt-30">
        <QueryErrorFallback
          title="페이지를 불러오지 못했습니다."
          description="일시적인 문제가 발생했습니다. 다시 시도해 주세요."
          onRetry={() => {
            window.location.reload();
          }}
        />
      </PageWrapper>
    </main>
  );
}
