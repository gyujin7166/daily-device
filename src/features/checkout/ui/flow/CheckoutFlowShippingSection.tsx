import { CHECKOUT_SECTION_TITLES } from '../../model/constants';
import CheckoutShippingForm from '../address/CheckoutShippingForm';
import CheckoutSection from '../common/CheckoutSection';

type CheckoutFlowShippingSectionProps = {
  onOpenAddressModal: () => void;
};

export default function CheckoutFlowShippingSection({
  onOpenAddressModal,
}: CheckoutFlowShippingSectionProps) {
  return (
    <CheckoutSection
      title={CHECKOUT_SECTION_TITLES.SHIPPING}
      action={
        <button
          type="button"
          onClick={onOpenAddressModal}
          className="rounded-full border border-line bg-primary-soft px-3 py-1 text-xs font-medium leading-4 text-primary shadow-xs transition hover:border-primary hover:bg-primary hover:text-surface dark:border-dark-border dark:bg-primary/20 dark:text-primary"
        >
          배송지 선택/입력
        </button>
      }
    >
      <CheckoutShippingForm />
    </CheckoutSection>
  );
}
