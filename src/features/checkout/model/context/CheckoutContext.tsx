'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import type { Dispatch, PropsWithChildren, SetStateAction } from 'react';

import {
  createInitialAddressBlurState,
  createInitialAddressFormState,
  createInitialAddressValidationState,
  validateAddressField,
} from '@entities/address/model/form';
import type {
  AddressBlurState,
  AddressFieldName,
  AddressFormState,
  AddressValidationState,
} from '@entities/address/model/form';

type AddressModalMode = 'saved' | 'new';
type ValidateCheckoutField = (
  value: string,
  inputFieldName: AddressFieldName,
) => boolean;

type CheckoutContextProps = {
  isFormValid: boolean;
  setIsFormValid: Dispatch<SetStateAction<boolean>>;
  formState: AddressFormState;
  setFormState: Dispatch<SetStateAction<AddressFormState>>;
  validationState: AddressValidationState;
  setValidationState: Dispatch<SetStateAction<AddressValidationState>>;
  blurState: AddressBlurState;
  setBlurState: Dispatch<SetStateAction<AddressBlurState>>;
  showPostcode: boolean;
  setShowPostcode: Dispatch<SetStateAction<boolean>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  selectedAddressId: number | null;
  setSelectedAddressId: Dispatch<SetStateAction<number | null>>;
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: Dispatch<SetStateAction<boolean>>;
  addressModalMode: AddressModalMode;
  setAddressModalMode: Dispatch<SetStateAction<AddressModalMode>>;
  editingAddressId: number | null;
  setEditingAddressId: Dispatch<SetStateAction<number | null>>;
  validateField: ValidateCheckoutField;
};

const CheckoutContext = createContext<CheckoutContextProps | undefined>(
  undefined,
);

export const useCheckoutContext = () => {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error(
      'useCheckoutContext must be used within a CheckoutContextProvider',
    );
  }

  return context;
};

export default function CheckoutProvider({ children }: PropsWithChildren) {
  const [formState, setFormState] = useState<AddressFormState>(
    createInitialAddressFormState(),
  );
  const [validationState, setValidationState] =
    useState<AddressValidationState>(createInitialAddressValidationState());
  const [blurState, setBlurState] = useState<AddressBlurState>(
    createInitialAddressBlurState(),
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const [address, setAddress] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] =
    useState<AddressModalMode>('saved');
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  const validateField = useCallback<ValidateCheckoutField>(
    (value, inputFieldName) => validateAddressField(value, inputFieldName),
    [],
  );

  return (
    <CheckoutContext.Provider
      value={{
        isFormValid,
        setIsFormValid,
        formState,
        setFormState,
        validationState,
        setValidationState,
        blurState,
        setBlurState,
        showPostcode,
        setShowPostcode,
        address,
        setAddress,
        selectedAddressId,
        setSelectedAddressId,
        isAddressModalOpen,
        setIsAddressModalOpen,
        addressModalMode,
        setAddressModalMode,
        editingAddressId,
        setEditingAddressId,
        validateField,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}
