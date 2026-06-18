import { useCallback } from 'react';
import type { ChangeEvent, Dispatch, FocusEvent, SetStateAction } from 'react';

import {
  buildAddressFromPostcode,
  isAddressFieldName,
  isRequiredAddressField,
  normalizeAddressFieldValue,
} from '@entities/address/model/form';
import type {
  AddressBlurState,
  AddressFieldName,
  AddressFormState,
  AddressValidationState,
} from '@entities/address/model/form';
import type { UserAddress } from '@entities/address/model/types';

import type { Address } from 'react-daum-postcode';

type ValidateCheckoutField = (
  value: string,
  inputFieldName: AddressFieldName,
) => boolean;

type UseCheckoutAddressFormControlsParams = {
  isUsingSavedAddress: boolean;
  setAddress: Dispatch<SetStateAction<string>>;
  setShowPostcode: Dispatch<SetStateAction<boolean>>;
  setFormState: Dispatch<SetStateAction<AddressFormState>>;
  setValidationState: Dispatch<SetStateAction<AddressValidationState>>;
  setBlurState: Dispatch<SetStateAction<AddressBlurState>>;
  validateField: ValidateCheckoutField;
};

export default function useCheckoutAddressFormControls({
  isUsingSavedAddress,
  setAddress,
  setShowPostcode,
  setFormState,
  setValidationState,
  setBlurState,
  validateField,
}: UseCheckoutAddressFormControlsParams) {
  const resetAddressFormState = useCallback(() => {
    setAddress('');
    setShowPostcode(false);
    setFormState((prev) => ({
      ...prev,
      name: '',
      phone_number: '',
      address_1: '',
      address_2: '',
    }));
    setValidationState((prev) => ({
      ...prev,
      name: false,
      phone_number: false,
      address_1: false,
      address_2: true,
    }));
    setBlurState((prev) => ({
      ...prev,
      name: false,
      phone_number: false,
      address_1: false,
      address_2: false,
    }));
  }, [
    setAddress,
    setBlurState,
    setFormState,
    setShowPostcode,
    setValidationState,
  ]);

  const setAddressFormState = useCallback(
    (savedAddress: UserAddress) => {
      setAddress(savedAddress.address1);
      setShowPostcode(false);

      setFormState((prev) => ({
        ...prev,
        name: savedAddress.recipientName,
        phone_number: savedAddress.recipientPhone,
        address_1: savedAddress.address1,
        address_2: savedAddress.address2 ?? '',
      }));

      setValidationState((prev) => ({
        ...prev,
        name: validateField(savedAddress.recipientName, 'name'),
        phone_number: validateField(
          savedAddress.recipientPhone,
          'phone_number',
        ),
        address_1: validateField(savedAddress.address1, 'address_1'),
        address_2: true,
      }));

      setBlurState((prev) => ({
        ...prev,
        name: false,
        phone_number: false,
        address_1: false,
        address_2: false,
      }));
    },
    [
      setAddress,
      setBlurState,
      setFormState,
      setShowPostcode,
      setValidationState,
      validateField,
    ],
  );

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isUsingSavedAddress) {
      return;
    }

    if (!isAddressFieldName(event.target.name)) {
      return;
    }

    const fieldName = event.target.name;
    const nextValue = normalizeAddressFieldValue(fieldName, event.target.value);
    const isRequired = isRequiredAddressField(fieldName);

    setFormState((prev) => ({
      ...prev,
      [fieldName]: nextValue,
    }));
    setValidationState((prev) => ({
      ...prev,
      [fieldName]: isRequired ? validateField(nextValue, fieldName) : true,
    }));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (isUsingSavedAddress) {
      return;
    }

    if (!isAddressFieldName(event.target.name)) {
      return;
    }

    const fieldName = event.target.name;
    const nextValue = normalizeAddressFieldValue(fieldName, event.target.value);
    const isRequired = isRequiredAddressField(fieldName);

    setBlurState((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    setValidationState((prev) => ({
      ...prev,
      [fieldName]: isRequired ? validateField(nextValue, fieldName) : true,
    }));
  };

  const handleAddressComplete = (data: Address) => {
    if (isUsingSavedAddress) {
      return;
    }

    const fullAddress = buildAddressFromPostcode(data);

    setAddress(fullAddress);
    setFormState((prev) => ({
      ...prev,
      address_1: fullAddress,
    }));
    setValidationState((prev) => ({
      ...prev,
      address_1: validateField(fullAddress, 'address_1'),
    }));
    setShowPostcode(false);
  };

  return {
    resetAddressFormState,
    setAddressFormState,
    handleFieldChange,
    handleBlur,
    handleAddressComplete,
  };
}
