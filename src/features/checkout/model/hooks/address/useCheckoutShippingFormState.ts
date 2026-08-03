import { useCallback, useEffect, useState } from 'react';

import {
  hasAddressFormValues,
  validateAddressField,
} from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';
import { useUserAddresses } from '@entities/address/queries/useUserAddresses';

import { useScrollLock } from '@shared/hooks/useScrollLock';

import {
  getOrderedCheckoutAddresses,
  getPreferredCheckoutAddress,
  isCheckoutAddressReady,
} from '../../shippingAddress';
import { useCheckoutStore } from '../../store/checkoutStore';

import useCheckoutAddressBookActions from './useCheckoutAddressBookActions';
import useCheckoutAddressFormControls from './useCheckoutAddressFormControls';

export default function useCheckoutShippingFormState() {
  const formState = useCheckoutStore((state) => state.formState);
  const validationState = useCheckoutStore((state) => state.validationState);
  const blurState = useCheckoutStore((state) => state.blurState);
  const showPostcode = useCheckoutStore((state) => state.showPostcode);
  const address = useCheckoutStore((state) => state.address);
  const selectedAddressId = useCheckoutStore(
    (state) => state.selectedAddressId,
  );
  const isAddressModalOpen = useCheckoutStore(
    (state) => state.isAddressModalOpen,
  );
  const addressModalMode = useCheckoutStore((state) => state.addressModalMode);
  const editingAddressId = useCheckoutStore((state) => state.editingAddressId);
  const {
    setFormState,
    setValidationState,
    setBlurState,
    setShowPostcode,
    setAddress,
    setSelectedAddressId,
    setIsAddressModalOpen,
    setAddressModalMode,
    setEditingAddressId,
  } = useCheckoutStore((state) => state.actions);

  const { data: userAddresses = [], isPending: isAddressesPending } =
    useUserAddresses();

  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [didInitDefault, setDidInitDefault] = useState(false);
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null);
  useScrollLock(isAddressModalOpen);

  const hasSavedAddresses = userAddresses.length > 0;
  const defaultAddress = userAddresses.find((item) => item.isDefault) ?? null;
  const recentAddress = userAddresses[0] ?? null;
  const hasDefaultAddress = defaultAddress !== null;
  const selectedAddress =
    userAddresses.find((item) => item.id === selectedAddressId) ?? null;
  const orderedAddresses = getOrderedCheckoutAddresses(
    userAddresses,
    selectedAddressId,
  );
  const isUsingSavedAddress =
    selectedAddressId !== null && addressModalMode === 'saved';
  const hasManualInput = hasAddressFormValues(formState);

  const isAddressReady = isCheckoutAddressReady(formState, validationState);
  const isNewAddressMode = addressModalMode === 'new';
  const isSavedAddressMode = addressModalMode === 'saved';
  const isEditingAddressMode = editingAddressId !== null;
  const isResolvingInitialAddressSelection =
    hasSavedAddresses &&
    selectedAddressId === null &&
    !hasManualInput &&
    !formState.address_1;
  const shouldShowAddressSummarySkeleton =
    isAddressesPending || isResolvingInitialAddressSelection;

  const {
    resetAddressFormState,
    setAddressFormState,
    handleFieldChange,
    handleBlur,
    handleAddressComplete,
  } = useCheckoutAddressFormControls({
    isUsingSavedAddress,
    setAddress,
    setShowPostcode,
    setFormState,
    setValidationState,
    setBlurState,
    validateField: validateAddressField,
  });

  const applySavedAddress = useCallback(
    (savedAddress: UserAddress) => {
      setSelectedAddressId(savedAddress.id);
      setSaveAsDefault(false);
      setEditingAddressId(null);
      setAddressFormState(savedAddress);
    },
    [setAddressFormState, setEditingAddressId, setSelectedAddressId],
  );

  const handleCloseAddressModal = () => {
    setShowPostcode(false);
    setEditingAddressId(null);
    setSaveAsDefault(false);
    setIsAddressModalOpen(false);
  };

  const handleSwitchToNewMode = () => {
    setSaveAsDefault(false);
    setEditingAddressId(null);
    resetAddressFormState();
    setAddressModalMode('new');
  };

  const handleSwitchToSavedMode = () => {
    setShowPostcode(false);
    setEditingAddressId(null);
    setSaveAsDefault(false);
    setAddressModalMode('saved');
  };

  const handleSelectSavedAddress = (savedAddress: UserAddress) => {
    applySavedAddress(savedAddress);
    handleCloseAddressModal();
  };

  const handleEditSavedAddress = (savedAddress: UserAddress) => {
    setEditingAddressId(savedAddress.id);
    setSaveAsDefault(savedAddress.isDefault);
    setAddressFormState(savedAddress);
    setAddressModalMode('new');
  };

  const {
    handleDeleteAddress,
    handleSaveAddress,
    isDeletingAddress,
    isSavingAddress,
  } = useCheckoutAddressBookActions({
    formState,
    isAddressReady,
    saveAsDefault,
    editingAddressId,
    selectedAddressId,
    setBlurState,
    setSelectedAddressId,
    setPendingDefaultId,
    setSaveAsDefault,
    setEditingAddressId,
    setAddressModalMode,
    resetAddressFormState,
  });
  const isAddressActionBusy = isDeletingAddress || isSavingAddress;

  const handleCancelAddressFormModal = () => {
    if (hasSavedAddresses) {
      handleSwitchToSavedMode();
      return;
    }
    handleCloseAddressModal();
  };

  useEffect(() => {
    if (didInitDefault) {
      return;
    }
    if (userAddresses.length === 0) {
      return;
    }
    if (addressModalMode === 'new' || editingAddressId !== null) {
      return;
    }

    const preferredAddress = getPreferredCheckoutAddress(
      defaultAddress,
      recentAddress,
    );
    if (preferredAddress && selectedAddressId === null && !hasManualInput) {
      applySavedAddress(preferredAddress);
    }
    setDidInitDefault(true);
  }, [
    addressModalMode,
    applySavedAddress,
    defaultAddress,
    didInitDefault,
    editingAddressId,
    hasManualInput,
    recentAddress,
    selectedAddressId,
    userAddresses.length,
  ]);

  useEffect(() => {
    if (selectedAddressId === null || selectedAddress || pendingDefaultId) {
      return;
    }

    const fallback = getPreferredCheckoutAddress(defaultAddress, recentAddress);
    if (fallback) {
      applySavedAddress(fallback);
    } else {
      setSelectedAddressId(null);
      resetAddressFormState();
    }
  }, [
    defaultAddress,
    applySavedAddress,
    pendingDefaultId,
    recentAddress,
    resetAddressFormState,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
  ]);

  useEffect(() => {
    if (userAddresses.length > 0) {
      return;
    }

    if (pendingDefaultId !== null) {
      setPendingDefaultId(null);
    }

    if (selectedAddressId !== null) {
      setSelectedAddressId(null);
      resetAddressFormState();
      return;
    }

    if (addressModalMode === 'new') {
      return;
    }

    if (hasManualInput) {
      resetAddressFormState();
    }
  }, [
    addressModalMode,
    hasManualInput,
    pendingDefaultId,
    resetAddressFormState,
    selectedAddressId,
    setSelectedAddressId,
    userAddresses.length,
  ]);

  useEffect(() => {
    if (!pendingDefaultId || selectedAddressId !== null) {
      return;
    }

    const nextAddress = userAddresses.find(
      (item) => item.id === pendingDefaultId,
    );
    if (nextAddress) {
      applySavedAddress(nextAddress);
      setPendingDefaultId(null);
    }
  }, [applySavedAddress, pendingDefaultId, selectedAddressId, userAddresses]);

  return {
    formState,
    validationState,
    blurState,
    showPostcode,
    address,
    saveAsDefault,
    isAddressModalOpen,
    selectedAddressId,
    selectedAddress,
    orderedAddresses,
    hasSavedAddresses,
    hasDefaultAddress,
    recentAddressId: recentAddress?.id ?? null,
    isAddressActionBusy,
    isNewAddressMode,
    isSavedAddressMode,
    isEditingAddressMode,
    isSavingAddress,
    isAddressReady,
    shouldShowAddressSummarySkeleton,
    setShowPostcode,
    setSaveAsDefault,
    handleCloseAddressModal,
    handleSwitchToNewMode,
    handleSwitchToSavedMode,
    handleSelectSavedAddress,
    handleEditSavedAddress,
    handleDeleteAddress,
    handleSaveAddress,
    handleCancelAddressFormModal,
    handleAddressComplete,
    handleFieldChange,
    handleBlur,
  };
}
