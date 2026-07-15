import type { Dispatch, MouseEvent, SetStateAction } from 'react';

import { useTranslations } from 'next-intl';

import type {
  AddressBlurState,
  AddressFormState,
} from '@entities/address/model/form';
import { useDeleteAddress } from '@entities/address/queries/useDeleteAddress';
import { useUpsertAddress } from '@entities/address/queries/useUpsertAddress';

import { getApiErrorMessage } from '@shared/lib/errors/apiErrorMessage';
import { toast } from '@shared/lib/toast';

import { buildCheckoutAddressPayload } from '../../shippingAddress';

type AddressModalMode = 'saved' | 'new';

type UseCheckoutAddressBookActionsParams = {
  formState: AddressFormState;
  isAddressReady: boolean;
  saveAsDefault: boolean;
  editingAddressId: number | null;
  selectedAddressId: number | null;
  setBlurState: Dispatch<SetStateAction<AddressBlurState>>;
  setSelectedAddressId: Dispatch<SetStateAction<number | null>>;
  setPendingDefaultId: Dispatch<SetStateAction<number | null>>;
  setSaveAsDefault: Dispatch<SetStateAction<boolean>>;
  setEditingAddressId: Dispatch<SetStateAction<number | null>>;
  setAddressModalMode: Dispatch<SetStateAction<AddressModalMode>>;
  resetAddressFormState: () => void;
};

export default function useCheckoutAddressBookActions({
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

  const handleSaveAddress = async () => {
    if (!isAddressReady) {
      setBlurState((prev) => ({
        ...prev,
        name: true,
        phone_number: true,
        address_1: true,
      }));
      toast.error(t('invalidAddress'));
      return;
    }

    try {
      const result = await upsertAddress(
        buildCheckoutAddressPayload(formState, saveAsDefault, editingAddressId),
      );

      if (result?.id) {
        setSelectedAddressId(result.id);
      }

      toast.success(t('saveSuccess'));
      setSaveAsDefault(false);
      setEditingAddressId(null);
      setAddressModalMode('saved');
    } catch (error) {
      const message = getApiErrorMessage(error, tApiError, t('saveFailed'));
      toast.error(message);
    }
  };

  return {
    handleDeleteAddress,
    handleSaveAddress,
    isDeletingAddress,
    isSavingAddress,
  };
}
