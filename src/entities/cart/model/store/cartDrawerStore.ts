'use client';

import { create } from 'zustand';

type CartDrawerActions = {
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

type CartDrawerStore = {
  isCartOpen: boolean;
  actions: CartDrawerActions;
};

export const useCartDrawerStore = create<CartDrawerStore>((set) => ({
  isCartOpen: false,
  actions: {
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    openCart: () =>
      set((state) => (state.isCartOpen ? state : { isCartOpen: true })),
    closeCart: () =>
      set((state) => (state.isCartOpen ? { isCartOpen: false } : state)),
  },
}));
