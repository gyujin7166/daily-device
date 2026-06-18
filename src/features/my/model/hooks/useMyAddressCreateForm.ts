import { useState } from 'react';
import type { ChangeEvent, FocusEvent } from 'react';

import {
  buildAddressFromPostcode,
  createInitialAddressBlurState,
  createInitialAddressFormState,
  createInitialAddressValidationState,
  isAddressFieldName,
  isRequiredAddressField,
  normalizeAddressFieldValue,
  normalizePhoneNumber,
  validateAddressField,
} from '@entities/address/model/form';
import type {
  AddressBlurState,
  AddressFormState,
  AddressValidationState,
} from '@entities/address/model/form';

import type { Address } from 'react-daum-postcode';

export const useMyAddressCreateForm = () => {
  const [showPostcode, setShowPostcode] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [formState, setFormState] = useState<AddressFormState>(
    createInitialAddressFormState(),
  );
  const [validationState, setValidationState] =
    useState<AddressValidationState>(createInitialAddressValidationState());
  const [blurState, setBlurState] = useState<AddressBlurState>(
    createInitialAddressBlurState(),
  );
  const [address, setAddress] = useState('');
  const isAddressReady =
    formState.name.trim().length > 0 &&
    formState.phone_number.trim().length > 0 &&
    formState.address_1.trim().length > 0 &&
    validationState.name &&
    validationState.phone_number &&
    validationState.address_1;

  const reset = () => {
    setFormState(createInitialAddressFormState());
    setValidationState(createInitialAddressValidationState());
    setBlurState(createInitialAddressBlurState());
    setAddress('');
    setShowPostcode(false);
    setSaveAsDefault(false);
  };

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      [fieldName]: isRequired
        ? validateAddressField(nextValue, fieldName)
        : true,
    }));
  };

  const handleFieldBlur = (event: FocusEvent<HTMLInputElement>) => {
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
      [fieldName]: isRequired
        ? validateAddressField(nextValue, fieldName)
        : true,
    }));
  };

  const handleAddressComplete = (data: Address) => {
    const fullAddress = buildAddressFromPostcode(data);
    const isAddressValid = validateAddressField(fullAddress, 'address_1');
    setAddress(fullAddress);
    setFormState((prev) => ({
      ...prev,
      address_1: fullAddress,
    }));
    setValidationState((prev) => ({
      ...prev,
      address_1: isAddressValid,
    }));
    setShowPostcode(false);
  };

  const getValidatedPayload = () => {
    const recipientName = formState.name.trim();
    const recipientPhone = normalizePhoneNumber(formState.phone_number);
    const address1 = formState.address_1.trim();
    const address2 = formState.address_2.trim();

    const isReady =
      recipientName &&
      recipientPhone &&
      address1 &&
      validateAddressField(recipientName, 'name') &&
      validateAddressField(recipientPhone, 'phone_number') &&
      validateAddressField(address1, 'address_1');

    if (!isReady) {
      setBlurState((prev) => ({
        ...prev,
        name: true,
        phone_number: true,
        address_1: true,
      }));
      return null;
    }

    return {
      recipientName,
      recipientPhone,
      address1,
      address2: address2 || undefined,
      isDefault: saveAsDefault,
    };
  };

  return {
    state: {
      showPostcode,
      formState,
      validationState,
      blurState,
      address,
      saveAsDefault,
      isAddressReady,
    },
    actions: {
      reset,
      getValidatedPayload,
      setShowPostcode,
      setSaveAsDefault,
      handleAddressComplete,
      handleFieldChange,
      handleFieldBlur,
    },
  };
};
