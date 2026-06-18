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
  return (
    <form className="grid grid-cols-1 gap-5" noValidate>
      <fieldset className="contents">
        <div className="col-span-full text-left">
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            테스트 결제 또는 데모 결제를 선택하세요. 실제 비용 청구나 상품
            배송은 발생하지 않습니다.
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
