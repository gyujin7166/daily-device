'use client';

import { create } from 'zustand';

type CartQuantities = Record<string, number>;

type CartQuantityActions = {
  replaceQuantities: (quantities: CartQuantities) => void;
  setQuantity: (variantKey: string, quantity: number) => void;
  removeQuantity: (variantKey: string) => void;
  resetQuantities: () => void;
};

type CartQuantityStore = {
  quantities: CartQuantities;
  actions: CartQuantityActions;
};

export const useCartQuantityStore = create<CartQuantityStore>((set) => ({
  quantities: {},
  actions: {
    replaceQuantities: (quantities) => set({ quantities }),
    setQuantity: (variantKey, quantity) =>
      set((state) =>
        state.quantities[variantKey] === quantity
          ? state
          : {
              quantities: {
                ...state.quantities,
                [variantKey]: quantity,
              },
            },
      ),
    removeQuantity: (variantKey) =>
      set((state) => {
        if (!(variantKey in state.quantities)) {
          return state;
        }

        const { [variantKey]: _removed, ...quantities } = state.quantities;
        return { quantities };
      }),
    resetQuantities: () =>
      set((state) =>
        Object.keys(state.quantities).length === 0 ? state : { quantities: {} },
      ),
  },
}));
