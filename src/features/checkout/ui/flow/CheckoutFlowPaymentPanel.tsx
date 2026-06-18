import type { Dispatch, SetStateAction } from 'react';

import Button from '@shared/ui/Button/Button';

import { CHECKOUT_SECTION_TITLES } from '../../model/constants';
import CheckoutSection from '../common/CheckoutSection';
import CheckoutPaymentForm from '../payment/CheckoutPaymentForm';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutFlowPaymentPanelProps = {
  selectedMethod: CheckoutPaymentMethod;
  onSelectMethod: Dispatch<SetStateAction<CheckoutPaymentMethod>>;
  isBusy: boolean;
  actionLabel: string;
  isActionDisabled: boolean;
  isCartSyncPending: boolean;
  onPay: () => void;
  className?: string;
};

export default function CheckoutFlowPaymentPanel({
  selectedMethod,
  onSelectMethod,
  isBusy,
  actionLabel,
  isActionDisabled,
  isCartSyncPending,
  onPay,
  className,
}: CheckoutFlowPaymentPanelProps) {
  return (
    <div className={className}>
      <CheckoutSection title={CHECKOUT_SECTION_TITLES.PAYMENT}>
        <CheckoutPaymentForm
          selectedMethod={selectedMethod}
          onSelectMethod={onSelectMethod}
          isBusy={isBusy}
        />
      </CheckoutSection>
      <div>
        <Button
          variant="secondary"
          size="lg"
          transition="enabled"
          onClick={onPay}
          disabled={isActionDisabled}
          type="button"
          className="w-full rounded-2xl disabled:cursor-not-allowed disabled:border-disabled-bg disabled:bg-disabled-bg disabled:text-disabled-text disabled:opacity-100"
        >
          {isCartSyncPending ? (
            <span
              aria-label="장바구니 반영 중"
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-surface/35 border-t-surface"
            />
          ) : (
            actionLabel
          )}
        </Button>
      </div>
    </div>
  );
}
