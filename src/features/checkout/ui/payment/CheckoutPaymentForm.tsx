import { useTranslations } from 'next-intl';

import CheckoutPaymentButton from './CheckoutPaymentButton';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutPaymentFormProps = {
  selectedMethod: CheckoutPaymentMethod;
  onSelectMethod: (method: CheckoutPaymentMethod) => void;
  isBusy?: boolean;
};

export default function CheckoutPaymentForm({
  selectedMethod,
  onSelectMethod,
  isBusy,
}: CheckoutPaymentFormProps) {
  const t = useTranslations('Checkout.payment');

  return (
    <form className="grid grid-cols-1 gap-5" noValidate>
      <fieldset className="contents">
        <div className="col-span-full text-left">
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            {t('description')}
          </p>
        </div>
        <CheckoutPaymentButton
          selectedMethod={selectedMethod}
          onSelectMethod={onSelectMethod}
          disabled={isBusy}
        />
      </fieldset>
    </form>
  );
}
