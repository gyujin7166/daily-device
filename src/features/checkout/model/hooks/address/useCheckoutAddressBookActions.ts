import type { Dispatch, MouseEvent, SetStateAction } from 'react';

import type {
  AddressBlurState,
  AddressFormState,
} from '@entities/address/model/form';
import { useDeleteAddress } from '@entities/address/queries/useDeleteAddress';
import { useUpsertAddress } from '@entities/address/queries/useUpsertAddress';

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
      toast.success('배송지가 삭제되었습니다.');

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
      const message =
        error instanceof Error ? error.message : '배송지 삭제에 실패했습니다.';
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
      toast.error('배송지 정보를 확인해주세요.');
      return;
    }

    try {
      const result = await upsertAddress(
        buildCheckoutAddressPayload(formState, saveAsDefault, editingAddressId),
      );

      if (result?.id) {
        setSelectedAddressId(result.id);
      }

      toast.success('배송지가 저장되었습니다.');
      setSaveAsDefault(false);
      setEditingAddressId(null);
      setAddressModalMode('saved');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '배송지 저장에 실패했습니다.';
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
