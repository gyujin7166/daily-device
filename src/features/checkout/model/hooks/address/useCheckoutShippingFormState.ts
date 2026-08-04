import { useCallback, useEffect, useState } from 'react';

import {
  createInitialAddressFormState,
  hasAddressFormValues,
} from '@entities/address/model/form';
import type { AddressFormState } from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';
import { useUserAddresses } from '@entities/address/queries/useUserAddresses';

import { useScrollLock } from '@shared/hooks/useScrollLock';

import {
  getOrderedCheckoutAddresses,
  getPreferredCheckoutAddress,
} from '../../shippingAddress';
import { useCheckoutStore } from '../../store/checkoutStore';

import useCheckoutAddressBookActions from './useCheckoutAddressBookActions';

const createFormStateFromSavedAddress = (
  savedAddress: UserAddress,
): AddressFormState => ({
  name: savedAddress.recipientName,
  phone_number: savedAddress.recipientPhone,
  address_1: savedAddress.address1,
  address_2: savedAddress.address2 ?? '',
});

export default function useCheckoutShippingFormState() {
  const formState = useCheckoutStore((state) => state.formState);
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
    setSelectedAddressId,
    setIsAddressModalOpen,
    setAddressModalMode,
    setEditingAddressId,
  } = useCheckoutStore((state) => state.actions);

  const { data: userAddresses = [], isPending: isAddressesPending } =
    useUserAddresses();

  const [didInitDefault, setDidInitDefault] = useState(false);
  const [pendingDefaultId, setPendingDefaultId] = useState<number | null>(null);
  useScrollLock(isAddressModalOpen);

  const hasSavedAddresses = userAddresses.length > 0;
  const defaultAddress = userAddresses.find((item) => item.isDefault) ?? null;
  const recentAddress = userAddresses[0] ?? null;
  const hasDefaultAddress = defaultAddress !== null;
  const selectedAddress =
    userAddresses.find((item) => item.id === selectedAddressId) ?? null;
  const editingAddress =
    userAddresses.find((item) => item.id === editingAddressId) ?? null;
  const orderedAddresses = getOrderedCheckoutAddresses(
    userAddresses,
    selectedAddressId,
  );
  const hasManualInput = hasAddressFormValues(formState);
  const isNewAddressMode = addressModalMode === 'new';
  const isSavedAddressMode = addressModalMode === 'saved';
  const isResolvingInitialAddressSelection =
    hasSavedAddresses && selectedAddressId === null && !hasManualInput;
  const shouldShowAddressSummarySkeleton =
    isAddressesPending || isResolvingInitialAddressSelection;

  const resetAddressFormState = useCallback(() => {
    setFormState(createInitialAddressFormState());
  }, [setFormState]);

  const setAddressFormState = useCallback(
    (savedAddress: UserAddress) => {
      setFormState(createFormStateFromSavedAddress(savedAddress));
    },
    [setFormState],
  );

  const applySavedAddress = useCallback(
    (savedAddress: UserAddress) => {
      setSelectedAddressId(savedAddress.id);
      setEditingAddressId(null);
      setAddressFormState(savedAddress);
    },
    [setAddressFormState, setEditingAddressId, setSelectedAddressId],
  );

  const handleCloseAddressModal = () => {
    setEditingAddressId(null);
    setIsAddressModalOpen(false);
  };

  const handleSwitchToNewMode = () => {
    setEditingAddressId(null);
    setAddressModalMode('new');
  };

  const handleSwitchToSavedMode = () => {
    setEditingAddressId(null);
    setAddressModalMode('saved');
  };

  const handleSelectSavedAddress = (savedAddress: UserAddress) => {
    applySavedAddress(savedAddress);
    handleCloseAddressModal();
  };

  const handleEditSavedAddress = (savedAddress: UserAddress) => {
    setEditingAddressId(savedAddress.id);
    setAddressModalMode('new');
  };

  const {
    handleDeleteAddress,
    handleSaveAddress,
    handleInvalidAddress,
    isDeletingAddress,
    isSavingAddress,
  } = useCheckoutAddressBookActions({
    editingAddressId,
    selectedAddressId,
    setFormState,
    setSelectedAddressId,
    setPendingDefaultId,
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
    isAddressModalOpen,
    selectedAddressId,
    selectedAddress,
    editingAddress,
    orderedAddresses,
    hasSavedAddresses,
    hasDefaultAddress,
    recentAddressId: recentAddress?.id ?? null,
    isAddressActionBusy,
    isNewAddressMode,
    isSavedAddressMode,
    isSavingAddress,
    shouldShowAddressSummarySkeleton,
    handleCloseAddressModal,
    handleSwitchToNewMode,
    handleSelectSavedAddress,
    handleEditSavedAddress,
    handleDeleteAddress,
    handleSaveAddress,
    handleInvalidAddress,
    handleCancelAddressFormModal,
  };
}
