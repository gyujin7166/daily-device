import CheckoutAddressModalController from './CheckoutAddressModalController';
import CheckoutAddressSummary from './CheckoutAddressSummary';

export default function CheckoutShippingForm() {
  return (
    <div className="grid grid-cols-2 gap-5 lg:gap-[1.563rem]">
      <CheckoutAddressSummary />
      <CheckoutAddressModalController />
    </div>
  );
}
