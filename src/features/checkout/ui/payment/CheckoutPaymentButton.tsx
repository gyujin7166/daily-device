import { useTranslations } from 'next-intl';

import CheckoutPaymentMethodCard from './CheckoutPaymentMethodCard';

import type { CheckoutPaymentMethod } from '../../model/payment';

type CheckoutPaymentButtonProps = {
  selectedMethod: CheckoutPaymentMethod;
  onSelectMethod: (method: CheckoutPaymentMethod) => void;
  disabled?: boolean;
};

export default function CheckoutPaymentButton({
  selectedMethod,
  onSelectMethod,
  disabled,
}: CheckoutPaymentButtonProps) {
  const t = useTranslations('Checkout.payment.methods');
  const paymentMethodOptions: Array<{
    method: CheckoutPaymentMethod;
    title: string;
    description: string;
  }> = [
    {
      method: 'test',
      title: t('test.title'),
      description: t('test.description'),
    },
    {
      method: 'demo',
      title: t('demo.title'),
      description: t('demo.description'),
    },
  ];

  return (
    <div className="col-span-full mt-4 grid gap-4">
      {paymentMethodOptions.map((option) => (
        <CheckoutPaymentMethodCard
          key={option.method}
          method={option.method}
          title={option.title}
          description={option.description}
          isSelected={selectedMethod === option.method}
          disabled={disabled}
          onSelectMethod={onSelectMethod}
        />
      ))}
    </div>
  );
}
