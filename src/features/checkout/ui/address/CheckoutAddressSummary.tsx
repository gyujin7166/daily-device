import { hasAddressFormValues } from '@entities/address/model/form';
import { useUserAddresses } from '@entities/address/queries/useUserAddresses';

import { useCheckoutStore } from '../../model/store/checkoutStore';

import AddressSummarySection from './AddressSummarySection';

export default function CheckoutAddressSummary() {
  const { data: userAddresses = [], isPending: isAddressesPending } =
    useUserAddresses();
  const formState = useCheckoutStore((state) => state.formState);
  const selectedAddressId = useCheckoutStore(
    (state) => state.selectedAddressId,
  );
  const selectedAddress =
    userAddresses.find((item) => item.id === selectedAddressId) ?? null;
  const isResolvingInitialAddressSelection =
    userAddresses.length > 0 &&
    selectedAddressId === null &&
    !hasAddressFormValues(formState);

  return (
    <div className="col-span-full">
      <AddressSummarySection
        summary={{
          isLoading: isAddressesPending || isResolvingInitialAddressSelection,
          selectedAddress,
          formState,
        }}
      />
    </div>
  );
}
