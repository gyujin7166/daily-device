import type { Dispatch, SetStateAction } from 'react';

import { useTranslations } from 'next-intl';

import Button from '@shared/ui/Button/Button';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

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
  const t = useTranslations('Checkout');

  return (
    <div className={className}>
      <CheckoutSection title={t('sections.payment')}>
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
            <>
              <Spinner size="sm" variant="inverse" className="size-5" />
              <span className="sr-only">
                {t('payment.actions.cartSyncing')}
              </span>
            </>
          ) : (
            actionLabel
          )}
        </Button>
      </div>
    </div>
  );
}
