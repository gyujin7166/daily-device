'use client';

import { create } from 'zustand';

type PendingVariantKeys = Record<string, true>;

type CartPendingActions = {
  startAddingNewItem: (variantKey: string) => void;
  finishAddingNewItem: (variantKey: string) => void;
  startCartSync: (variantKey: string) => void;
  finishCartSync: (variantKey: string) => void;
  resetPendingState: () => void;
};

type CartPendingStore = {
  pendingAddingItemKeys: PendingVariantKeys;
  pendingCartSyncKeys: PendingVariantKeys;
  actions: CartPendingActions;
};

export const useCartPendingStore = create<CartPendingStore>((set) => ({
  pendingAddingItemKeys: {},
  pendingCartSyncKeys: {},
  actions: {
    startAddingNewItem: (variantKey) =>
      set((state) =>
        state.pendingAddingItemKeys[variantKey]
          ? state
          : {
              pendingAddingItemKeys: {
                ...state.pendingAddingItemKeys,
                [variantKey]: true,
              },
            },
      ),
    finishAddingNewItem: (variantKey) =>
      set((state) => {
        if (!state.pendingAddingItemKeys[variantKey]) {
          return state;
        }

        const { [variantKey]: _removed, ...pendingAddingItemKeys } =
          state.pendingAddingItemKeys;
        return { pendingAddingItemKeys };
      }),
    startCartSync: (variantKey) =>
      set((state) =>
        state.pendingCartSyncKeys[variantKey]
          ? state
          : {
              pendingCartSyncKeys: {
                ...state.pendingCartSyncKeys,
                [variantKey]: true,
              },
            },
      ),
    finishCartSync: (variantKey) =>
      set((state) => {
        if (!state.pendingCartSyncKeys[variantKey]) {
          return state;
        }

        const { [variantKey]: _removed, ...pendingCartSyncKeys } =
          state.pendingCartSyncKeys;
        return { pendingCartSyncKeys };
      }),
    resetPendingState: () =>
      set((state) =>
        Object.keys(state.pendingAddingItemKeys).length === 0 &&
        Object.keys(state.pendingCartSyncKeys).length === 0
          ? state
          : {
              pendingAddingItemKeys: {},
              pendingCartSyncKeys: {},
            },
      ),
  },
}));
