'use client';

import type { SetStateAction } from 'react';

import { create } from 'zustand';

import { createInitialAddressFormState } from '@entities/address/model/form';
import type { AddressFormState } from '@entities/address/model/form';
import { addressFormSchema } from '@entities/address/model/schema';

export type AddressModalMode = 'saved' | 'new';

type CheckoutActions = {
  setFormState: (next: SetStateAction<AddressFormState>) => void;
  setSelectedAddressId: (next: SetStateAction<number | null>) => void;
  setIsAddressModalOpen: (next: SetStateAction<boolean>) => void;
  setAddressModalMode: (next: SetStateAction<AddressModalMode>) => void;
  setEditingAddressId: (next: SetStateAction<number | null>) => void;
  resetCheckoutState: () => void;
};

type CheckoutState = {
  formState: AddressFormState;
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
  selectedAddressId: null,
  isAddressModalOpen: false,
  addressModalMode: 'saved',
  editingAddressId: null,
});

const resolveStateAction = <T>(next: SetStateAction<T>, previous: T): T =>
  typeof next === 'function' ? (next as (previous: T) => T)(previous) : next;

export const selectIsCheckoutFormValid = (state: CheckoutStore) =>
  addressFormSchema.safeParse(state.formState).success;

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  ...createInitialCheckoutState(),
  actions: {
    setFormState: (next) =>
      set((state) => ({
        formState: resolveStateAction(next, state.formState),
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
