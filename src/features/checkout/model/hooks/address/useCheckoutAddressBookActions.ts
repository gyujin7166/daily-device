import type { Dispatch, MouseEvent, SetStateAction } from 'react';

import { useTranslations } from 'next-intl';

import type { AddressFormState } from '@entities/address/model/form';
import { toAddressFormPayload } from '@entities/address/model/schema';
import type { AddressFormValues } from '@entities/address/model/schema';
import { useDeleteAddress } from '@entities/address/queries/useDeleteAddress';
import { useUpsertAddress } from '@entities/address/queries/useUpsertAddress';

import { getApiErrorMessage } from '@shared/lib/errors/apiErrorMessage';
import { toast } from '@shared/lib/toast';

type AddressModalMode = 'saved' | 'new';

type UseCheckoutAddressBookActionsParams = {
  editingAddressId: number | null;
  selectedAddressId: number | null;
  setFormState: Dispatch<SetStateAction<AddressFormState>>;
  setSelectedAddressId: Dispatch<SetStateAction<number | null>>;
  setPendingDefaultId: Dispatch<SetStateAction<number | null>>;
  setEditingAddressId: Dispatch<SetStateAction<number | null>>;
  setAddressModalMode: Dispatch<SetStateAction<AddressModalMode>>;
  resetAddressFormState: () => void;
};

export default function useCheckoutAddressBookActions({
  editingAddressId,
  selectedAddressId,
  setFormState,
  setSelectedAddressId,
  setPendingDefaultId,
  setEditingAddressId,
  setAddressModalMode,
  resetAddressFormState,
}: UseCheckoutAddressBookActionsParams) {
  const t = useTranslations('Checkout.shipping.toast');
  const tApiError = useTranslations('Common.apiErrors');
  const { mutateAsync: upsertAddress, isPending: isSavingAddress } =
    useUpsertAddress();
  const { mutateAsync: deleteAddress, isPending: isDeletingAddress } =
    useDeleteAddress();

  const handleDeleteAddress = async (
    event: MouseEvent<HTMLButtonElement>,
    addressId: number,
  ) => {
    event.stopPropagation();
    if (isDeletingAddress) {
      return;
    }

    try {
      const result = await deleteAddress({ id: addressId });
      toast.success(t('deleteSuccess'));

      const shouldApplyFallback =
        selectedAddressId === null || selectedAddressId === addressId;

      if (result?.newDefaultId && shouldApplyFallback) {
        setPendingDefaultId(result.newDefaultId);
      }

      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
        resetAddressFormState();
      }
    } catch (error) {
      const message = getApiErrorMessage(error, tApiError, t('deleteFailed'));
      toast.error(message);
    }
  };

  const handleSaveAddress = async (
    formValues: AddressFormValues,
    isDefault: boolean,
  ) => {
    const payload = toAddressFormPayload(formValues, isDefault);

    try {
      const result = await upsertAddress({
        id: editingAddressId ?? undefined,
        ...payload,
      });

      setFormState({
        name: payload.recipientName,
        phone_number: payload.recipientPhone,
        address_1: payload.address1,
        address_2: payload.address2 ?? '',
      });

      if (result?.id) {
        setSelectedAddressId(result.id);
      }

      toast.success(t('saveSuccess'));
      setEditingAddressId(null);
      setAddressModalMode('saved');
    } catch (error) {
      const message = getApiErrorMessage(error, tApiError, t('saveFailed'));
      toast.error(message);
    }
  };

  const handleInvalidAddress = () => {
    toast.error(t('invalidAddress'));
  };

  return {
    handleDeleteAddress,
    handleSaveAddress,
    handleInvalidAddress,
    isDeletingAddress,
    isSavingAddress,
  };
}
