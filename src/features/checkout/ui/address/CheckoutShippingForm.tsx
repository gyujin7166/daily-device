import { useTranslations } from 'next-intl';

import { AddressFormModal } from '@entities/address/ui';

import useCheckoutShippingFormState from '../../model/hooks/address/useCheckoutShippingFormState';

import AddressSummarySection from './AddressSummarySection';
import CheckoutSavedAddressModal from './CheckoutSavedAddressModal';

export default function CheckoutShippingForm() {
  const t = useTranslations('Checkout.shipping.form');
  const {
    formState,
    validationState,
    blurState,
    showPostcode,
    setShowPostcode,
    address,
    saveAsDefault,
    setSaveAsDefault,
    isAddressModalOpen,
    isSavedAddressMode,
    isNewAddressMode,
    isEditingAddressMode,
    isSavingAddress,
    isAddressReady,
    selectedAddressId,
    selectedAddress,
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
    handleCancelAddressFormModal,
    handleAddressComplete,
    handleFieldChange,
    handleBlur,
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
  const addressFormModalState = {
    title: isEditingAddressMode ? t('editTitle') : t('createTitle'),
    isSaving: isSavingAddress,
    showPostcode,
    formState,
    validationState,
    blurState,
    address,
    saveAsDefault,
    isAddressReady,
  };
  const addressFormModalActions = {
    onClose: handleCloseAddressModal,
    onCancel: handleCancelAddressFormModal,
    onSave: handleSaveAddress,
    onShowPostcodeChange: (isOpen: boolean) => setShowPostcode(isOpen),
    onSaveAsDefaultChange: (isDefault: boolean) => setSaveAsDefault(isDefault),
    onAddressComplete: handleAddressComplete,
    onFieldChange: handleFieldChange,
    onFieldBlur: handleBlur,
  };

  return (
    <form className="grid grid-cols-2 gap-5 lg:gap-[1.563rem]" noValidate>
      <fieldset className="contents">
        <div className="col-span-full">
          <AddressSummarySection summary={addressSummary} />
        </div>
      </fieldset>
      <CheckoutSavedAddressModal
        state={savedAddressModalState}
        actions={savedAddressModalActions}
      />
      <AddressFormModal
        isOpen={isAddressModalOpen && isNewAddressMode}
        state={addressFormModalState}
        actions={addressFormModalActions}
      />
    </form>
  );
}
