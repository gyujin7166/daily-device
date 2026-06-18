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
  const paymentMethodOptions: Array<{
    method: CheckoutPaymentMethod;
    title: string;
    description: string;
  }> = [
    {
      method: 'test',
      title: '테스트 결제',
      description: '토스 테스트 결제창으로 이동하며 실제 청구는 없습니다.',
    },
    {
      method: 'demo',
      title: '데모 결제',
      description: '결제 승인 없이 주문을 확정하는 데모 흐름입니다.',
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
