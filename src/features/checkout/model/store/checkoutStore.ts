'use client';

import type { SetStateAction } from 'react';

import { create } from 'zustand';

import {
  createInitialAddressBlurState,
  createInitialAddressFormState,
  createInitialAddressValidationState,
} from '@entities/address/model/form';
import type {
  AddressBlurState,
  AddressFormState,
  AddressValidationState,
} from '@entities/address/model/form';

export type AddressModalMode = 'saved' | 'new';

type CheckoutActions = {
  setFormState: (next: SetStateAction<AddressFormState>) => void;
  setValidationState: (next: SetStateAction<AddressValidationState>) => void;
  setBlurState: (next: SetStateAction<AddressBlurState>) => void;
  setShowPostcode: (next: SetStateAction<boolean>) => void;
  setAddress: (next: SetStateAction<string>) => void;
  setSelectedAddressId: (next: SetStateAction<number | null>) => void;
  setIsAddressModalOpen: (next: SetStateAction<boolean>) => void;
  setAddressModalMode: (next: SetStateAction<AddressModalMode>) => void;
  setEditingAddressId: (next: SetStateAction<number | null>) => void;
  resetCheckoutState: () => void;
};

type CheckoutState = {
  formState: AddressFormState;
  validationState: AddressValidationState;
  blurState: AddressBlurState;
  showPostcode: boolean;
  address: string;
  selectedAddressId: number | null;
  isAddressModalOpen: boolean;
  addressModalMode: AddressModalMode;
  editingAddressId: number | null;
};

type CheckoutStore = CheckoutState & {
  actions: CheckoutActions;
};

const createInitialCheckoutState = (): CheckoutState => ({
  formState: createInitialAddressFormState(),
  validationState: createInitialAddressValidationState(),
  blurState: createInitialAddressBlurState(),
  showPostcode: false,
  address: '',
  selectedAddressId: null,
  isAddressModalOpen: false,
  addressModalMode: 'saved',
  editingAddressId: null,
});

const resolveStateAction = <T>(next: SetStateAction<T>, previous: T): T =>
  typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;

export const selectIsCheckoutFormValid = (state: CheckoutStore) =>
  Object.values(state.validationState).every(Boolean);

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...createInitialCheckoutState(),
  actions: {
    setFormState: (next) =>
      set((state) => ({
        formState: resolveStateAction(next, state.formState),
      })),
    setValidationState: (next) =>
      set((state) => ({
        validationState: resolveStateAction(next, state.validationState),
      })),
    setBlurState: (next) =>
      set((state) => ({
        blurState: resolveStateAction(next, state.blurState),
      })),
    setShowPostcode: (next) =>
      set((state) => ({
        showPostcode: resolveStateAction(next, state.showPostcode),
      })),
    setAddress: (next) =>
      set((state) => ({
        address: resolveStateAction(next, state.address),
      })),
    setSelectedAddressId: (next) =>
      set((state) => ({
        selectedAddressId: resolveStateAction(next, state.selectedAddressId),
      })),
    setIsAddressModalOpen: (next) =>
      set((state) => ({
        isAddressModalOpen: resolveStateAction(next, state.isAddressModalOpen),
      })),
    setAddressModalMode: (next) =>
      set((state) => ({
        addressModalMode: resolveStateAction(next, state.addressModalMode),
      })),
    setEditingAddressId: (next) =>
      set((state) => ({
        editingAddressId: resolveStateAction(next, state.editingAddressId),
      })),
    resetCheckoutState: () => set(createInitialCheckoutState()),
  },
}));
