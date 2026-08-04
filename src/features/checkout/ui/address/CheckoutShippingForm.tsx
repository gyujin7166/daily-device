import { useTranslations } from 'next-intl';

import { AddressFormModal } from '@entities/address/ui';

import useCheckoutShippingFormState from '../../model/hooks/address/useCheckoutShippingFormState';

import AddressSummarySection from './AddressSummarySection';
import CheckoutSavedAddressModal from './CheckoutSavedAddressModal';

export default function CheckoutShippingForm() {
  const t = useTranslations('Checkout.shipping.form');
  const {
    formState,
    isAddressModalOpen,
    isSavedAddressMode,
    isNewAddressMode,
    isSavingAddress,
    selectedAddressId,
    selectedAddress,
    editingAddress,
    orderedAddresses,
    hasSavedAddresses,
    hasDefaultAddress,
    recentAddressId,
    isAddressActionBusy,
    shouldShowAddressSummarySkeleton,
    handleCloseAddressModal,
    handleSwitchToNewMode,
    handleSelectSavedAddress,
    handleEditSavedAddress,
    handleDeleteAddress,
    handleSaveAddress,
    handleInvalidAddress,
    handleCancelAddressFormModal,
  } = useCheckoutShippingFormState();

  const addressSummary = {
    isLoading: shouldShowAddressSummarySkeleton,
    selectedAddress,
    formState,
  };
  const savedAddressModalState = {
    isOpen: isAddressModalOpen && isSavedAddressMode,
    hasSavedAddresses,
    orderedAddresses,
    selectedAddressId,
    hasDefaultAddress,
    recentAddressId,
    isAddressActionBusy,
  };
  const savedAddressModalActions = {
    onClose: handleCloseAddressModal,
    onSwitchToNewMode: handleSwitchToNewMode,
    onSelectSavedAddress: handleSelectSavedAddress,
    onEditSavedAddress: handleEditSavedAddress,
    onDeleteAddress: handleDeleteAddress,
  };
  const initialValues = editingAddress
    ? {
        name: editingAddress.recipientName,
        phone_number: editingAddress.recipientPhone,
        address_1: editingAddress.address1,
        address_2: editingAddress.address2 ?? '',
      }
    : undefined;

  return (
    <div className="grid grid-cols-2 gap-5 lg:gap-[1.563rem]">
      <div className="col-span-full">
        <AddressSummarySection summary={addressSummary} />
      </div>
      <CheckoutSavedAddressModal
        state={savedAddressModalState}
        actions={savedAddressModalActions}
      />
      {isAddressModalOpen && isNewAddressMode ? (
        <AddressFormModal
          key={editingAddress?.id ?? 'new'}
          title={editingAddress ? t('editTitle') : t('createTitle')}
          initialValues={initialValues}
          initialIsDefault={editingAddress?.isDefault}
          isSaving={isSavingAddress}
          onClose={handleCloseAddressModal}
          onCancel={handleCancelAddressFormModal}
          onSave={handleSaveAddress}
          onInvalid={handleInvalidAddress}
        />
      ) : null}
    </div>
  );
}
