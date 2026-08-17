import { useTranslations } from 'next-intl';

import { AddressFormModal } from '@entities/address/ui';

import useCheckoutShippingFormState from '../../model/hooks/address/useCheckoutShippingFormState';

import CheckoutSavedAddressModal from './CheckoutSavedAddressModal';

export default function CheckoutAddressModalController() {
  const t = useTranslations('Checkout.shipping.form');
  const {
    isAddressModalOpen,
    isSavedAddressMode,
    isNewAddressMode,
    isSavingAddress,
    selectedAddressId,
    editingAddress,
    orderedAddresses,
    hasSavedAddresses,
    hasDefaultAddress,
    recentAddressId,
    isAddressActionBusy,
    handleCloseAddressModal,
    handleSwitchToNewMode,
    handleSelectSavedAddress,
    handleEditSavedAddress,
    handleDeleteAddress,
    handleSaveAddress,
    handleInvalidAddress,
    handleCancelAddressFormModal,
  } = useCheckoutShippingFormState();

  const initialValues = editingAddress
    ? {
        name: editingAddress.recipientName,
        phone_number: editingAddress.recipientPhone,
        address_1: editingAddress.address1,
        address_2: editingAddress.address2 ?? '',
      }
    : undefined;

  return (
    <>
      <CheckoutSavedAddressModal
        state={{
          isOpen: isAddressModalOpen && isSavedAddressMode,
          hasSavedAddresses,
          orderedAddresses,
          selectedAddressId,
          hasDefaultAddress,
          recentAddressId,
          isAddressActionBusy,
        }}
        actions={{
          onClose: handleCloseAddressModal,
          onSwitchToNewMode: handleSwitchToNewMode,
          onSelectSavedAddress: handleSelectSavedAddress,
          onEditSavedAddress: handleEditSavedAddress,
          onDeleteAddress: handleDeleteAddress,
        }}
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
    </>
  );
}
