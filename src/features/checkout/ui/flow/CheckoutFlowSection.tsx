import type { Dispatch, SetStateAction } from 'react';

import type { UserCartItem } from '@entities/cart/model/types';

import CheckoutOrderComplete from '../complete/CheckoutOrderComplete';

import CheckoutFlowOrderItemsSection from './CheckoutFlowOrderItemsSection';
import CheckoutFlowPaymentPanel from './CheckoutFlowPaymentPanel';
import CheckoutFlowShippingSection from './CheckoutFlowShippingSection';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutFlowSectionProps = {
  orderNumber: string | null;
  isAddressModalOpen: boolean;
  hasCheckoutItems: boolean;
  totalQuantity: number;
  checkoutItems: UserCartItem[];
  checkoutTotalPrice: number;
  isBuyNowRequested: boolean;
  actionLabel: string;
  isActionDisabled: boolean;
  isBusy: boolean;
  isCartSyncPending: boolean;
  selectedMethod: CheckoutPaymentMethod;
  onSelectMethod: Dispatch<SetStateAction<CheckoutPaymentMethod>>;
  onPay: () => void;
  onOpenAddressModal: () => void;
};

export default function CheckoutFlowSection({
  orderNumber,
  isAddressModalOpen,
  hasCheckoutItems,
  totalQuantity,
  checkoutItems,
  checkoutTotalPrice,
  isBuyNowRequested,
  actionLabel,
  isActionDisabled,
  isBusy,
  isCartSyncPending,
  selectedMethod,
  onSelectMethod,
  onPay,
  onOpenAddressModal,
}: CheckoutFlowSectionProps) {
  const rootClassName = `grid items-start gap-6 pb-12 md:pb-16 lg:pb-24 ${
    !orderNumber ? 'xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]' : ''
  }`;
  const shippingColumnClassName = `grid gap-y-5 xl:sticky xl:top-10 xl:gap-y-6 xl:self-start ${
    isAddressModalOpen ? 'xl:z-150' : 'xl:z-10'
  }`;

  return (
    <div className={rootClassName}>
      {orderNumber ? (
        <div className="grid gap-y-5 lg:gap-y-6">
          <CheckoutOrderComplete orderNumber={orderNumber} />
        </div>
      ) : (
        <>
          <div className={shippingColumnClassName}>
            <CheckoutFlowShippingSection
              onOpenAddressModal={onOpenAddressModal}
            />
            <CheckoutFlowPaymentPanel
              selectedMethod={selectedMethod}
              onSelectMethod={onSelectMethod}
              isBusy={isBusy}
              actionLabel={actionLabel}
              isActionDisabled={isActionDisabled}
              isCartSyncPending={isCartSyncPending}
              onPay={onPay}
              className="hidden xl:grid xl:gap-y-6"
            />
          </div>
          {hasCheckoutItems ? (
            <div className="flex flex-col gap-y-5 lg:gap-y-6">
              <CheckoutFlowOrderItemsSection
                totalQuantity={totalQuantity}
                checkoutItems={checkoutItems}
                checkoutTotalPrice={checkoutTotalPrice}
                isBuyNowRequested={isBuyNowRequested}
              />
              <CheckoutFlowPaymentPanel
                selectedMethod={selectedMethod}
                onSelectMethod={onSelectMethod}
                isBusy={isBusy}
                actionLabel={actionLabel}
                isActionDisabled={isActionDisabled}
                isCartSyncPending={isCartSyncPending}
                onPay={onPay}
                className="grid gap-y-5 xl:hidden"
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
