'use client';
import PageHeader from '@shared/ui/Header/PageHeader';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import useCheckoutPageState from '../../model/hooks/page/useCheckoutPageState';
import CheckoutFlowSection from '../flow/CheckoutFlowSection';

import CheckoutPageEmptyState from './CheckoutPageEmptyState';

function CheckoutDemoNotice() {
  return (
    <div className="mb-6 rounded-2xl border border-primary/20 bg-primary-soft px-5 py-4 text-sm leading-6 text-primary dark:border-primary/35 dark:bg-blue-950/35 dark:text-blue-100">
      <p className="font-semibold">포트폴리오 데모 안내</p>
      <p className="mt-1 text-muted dark:text-dark-muted">
        이 주문/결제 화면은 기능 시연용입니다. 테스트 결제와 데모 결제 모두
        실제 비용 청구나 상품 배송이 발생하지 않습니다.
      </p>
    </div>
  );
}

export default function CheckoutPageContent() {
  const {
    isAddressModalOpen,
    orderNumber,
    hasCheckoutItems,
    totalQuantity,
    effectiveCheckoutItems,
    checkoutTotalPrice,
    isBuyNowRequested,
    actionLabel,
    handlePay,
    isActionDisabled,
    isBusy,
    isCartSyncPending,
    selectedMethod,
    setSelectedMethod,
    checkoutViewState,
    handleOpenAddressModal,
    handleGoHome,
  } = useCheckoutPageState();

  const isLoading = checkoutViewState === 'loading';
  const isEmpty = checkoutViewState === 'empty';
  const containerClassName = `grid gap-6 ${isEmpty ? 'pt-10' : ''}`;

  return (
    <main className="relative grow bg-canvas dark:bg-dark-bg">
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center -mt-14.5 md:-mt-22 lg:-mt-26">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={containerClassName}>
          {!isEmpty && <PageHeader title="주문/결제" />}
          <PageWrapper className="md:px-10">
            {isEmpty ? (
              <CheckoutPageEmptyState onGoHome={handleGoHome} />
            ) : (
              <>
                {!orderNumber ? <CheckoutDemoNotice /> : null}
                <CheckoutFlowSection
                  orderNumber={orderNumber}
                  isAddressModalOpen={isAddressModalOpen}
                  hasCheckoutItems={hasCheckoutItems}
                  totalQuantity={totalQuantity}
                  checkoutItems={effectiveCheckoutItems}
                  checkoutTotalPrice={checkoutTotalPrice}
                  isBuyNowRequested={isBuyNowRequested}
                  actionLabel={actionLabel}
                  isActionDisabled={isActionDisabled}
                  isBusy={isBusy}
                  isCartSyncPending={isCartSyncPending}
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                  onPay={handlePay}
                  onOpenAddressModal={handleOpenAddressModal}
                />
              </>
            )}
          </PageWrapper>
        </div>
      )}
    </main>
  );
}
