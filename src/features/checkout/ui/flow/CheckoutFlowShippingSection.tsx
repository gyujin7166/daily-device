import { useTranslations } from 'next-intl';

import { useCheckoutStore } from '../../model/store/checkoutStore';
import CheckoutShippingForm from '../address/CheckoutShippingForm';
import CheckoutSection from '../common/CheckoutSection';

export default function CheckoutFlowShippingSection() {
  const t = useTranslations('Checkout');
  const { setIsAddressModalOpen, setAddressModalMode, setEditingAddressId } =
    useCheckoutStore((state) => state.actions);

  const handleOpenAddressModal = () => {
    setEditingAddressId(null);
    setAddressModalMode('saved');
    setIsAddressModalOpen(true);
  };

  return (
    <CheckoutSection
      title={t('sections.shipping')}
      action={
        <button
          type="button"
          onClick={handleOpenAddressModal}
          className="rounded-full border border-line bg-primary-soft px-3 py-1 text-xs font-medium leading-4 text-primary shadow-xs transition hover:border-primary hover:bg-primary hover:text-surface dark:border-dark-border dark:bg-primary/20 dark:text-primary"
        >
          {t('shipping.selectOrEnter')}
        </button>
      }
    >
      <CheckoutShippingForm />
    </CheckoutSection>
  );
}
