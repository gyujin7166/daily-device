import type { Dispatch, SetStateAction } from 'react';

import type { UserCartItem } from '@entities/cart/model/types';

import CheckoutOrderComplete from '../complete/CheckoutOrderComplete';

import CheckoutFlowOrderItemsSection from './CheckoutFlowOrderItemsSection';
import CheckoutFlowPaymentPanel from './CheckoutFlowPaymentPanel';
import CheckoutFlowShippingColumn from './CheckoutFlowShippingColumn';
import CheckoutFlowShippingSection from './CheckoutFlowShippingSection';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutFlowSectionProps = {
  orderNumber: string | null;
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
};

export default function CheckoutFlowSection({
  orderNumber,
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
}: CheckoutFlowSectionProps) {
  const rootClassName = `grid items-start gap-6 pb-12 md:pb-16 lg:pb-24 ${
    !orderNumber ? 'xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]' : ''
  }`;
  return (
    <div className={rootClassName}>
      {orderNumber ? (
        <div className="grid gap-y-5 lg:gap-y-6">
          <CheckoutOrderComplete orderNumber={orderNumber} />
        </div>
      ) : (
        <>
          <CheckoutFlowShippingColumn>
            <CheckoutFlowShippingSection />
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
          </CheckoutFlowShippingColumn>
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
