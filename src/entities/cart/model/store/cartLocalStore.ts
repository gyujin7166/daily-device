'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import type { LocalCartItem } from '@entities/cart/model/types';

import type { CartItem } from '@prisma/client';
import type { StateStorage } from 'zustand/middleware';

type LocalCartInput = Pick<CartItem, 'productId' | 'quantity'> & {
  cartItemId?: number;
  productColorId?: number;
  colorName?: string;
  product?: LocalCartItem['product'];
};

type LocalCartVariant = Pick<CartItem, 'productId'> & {
  productColorId?: number;
  colorName?: string;
};

type CartLocalActions = {
  updateLocalCart: (newItem: LocalCartInput) => void;
  deleteLocalCartItem: (selectedItem: LocalCartVariant) => void;
  clearLocalCart: () => void;
  setHasHydrated: () => void;
};

type CartLocalStore = {
  hasHydrated: boolean;
  localCartItems: LocalCartItem[];
  actions: CartLocalActions;
};

const localCartStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedCart = window.localStorage.getItem(name);
    if (!storedCart) {
      return null;
    }

    try {
      const parsedCart: unknown = JSON.parse(storedCart);

      // 기존 Context 구현에서 저장한 배열도 Zustand persist 형식으로 복원한다.
      if (Array.isArray(parsedCart)) {
        return JSON.stringify({
          state: { localCartItems: parsedCart },
          version: 0,
        });
      }

      if (
        parsedCart &&
        typeof parsedCart === 'object' &&
        'state' in parsedCart
      ) {
        return storedCart;
      }

      return null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const persistedCart = JSON.parse(value) as {
        state?: { localCartItems?: unknown };
      };

      if (
        Array.isArray(persistedCart.state?.localCartItems) &&
        persistedCart.state.localCartItems.length === 0
      ) {
        window.localStorage.removeItem(name);
        return;
      }
    } catch {
      // persist가 생성한 값은 JSON이지만, 형식이 달라져도 저장 자체는 유지한다.
    }

    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(name);
    }
  },
};

export const useCartLocalStore = create<CartLocalStore>()(
  persist(
    (set) => ({
      hasHydrated: false,
      localCartItems: [],
      actions: {
        updateLocalCart: (newItem) =>
          set((state) => {
            const existingItemIndex = state.localCartItems.findIndex((item) =>
              isSameCartVariant(item, newItem),
            );

            if (existingItemIndex < 0) {
              if (!newItem.product) {
                return state;
              }

              return {
                localCartItems: [
                  ...state.localCartItems,
                  {
                    productId: newItem.productId,
                    productColorId: newItem.productColorId ?? null,
                    colorName: newItem.colorName ?? null,
                    quantity: Math.min(newItem.quantity, 10),
                    product: newItem.product,
                  },
                ],
              };
            }

            return {
              localCartItems: state.localCartItems.map((item, index) =>
                index === existingItemIndex
                  ? {
                      ...item,
                      quantity: Math.min(newItem.quantity, 10),
                      productColorId:
                        newItem.productColorId ?? item.productColorId,
                      colorName: newItem.colorName ?? item.colorName,
                    }
                  : item,
              ),
            };
          }),
        deleteLocalCartItem: (selectedItem) =>
          set((state) => {
            const localCartItems = state.localCartItems.filter(
              (item) => !isSameCartVariant(item, selectedItem),
            );

            return localCartItems.length === state.localCartItems.length
              ? state
              : { localCartItems };
          }),
        clearLocalCart: () =>
          set((state) =>
            state.localCartItems.length === 0 ? state : { localCartItems: [] },
          ),
        setHasHydrated: () =>
          set((state) => (state.hasHydrated ? state : { hasHydrated: true })),
      },
    }),
    {
      name: 'localCart',
      storage: createJSONStorage(() => localCartStorage),
      partialize: ({ localCartItems }) => ({ localCartItems }),
      skipHydration: true,
      onRehydrateStorage: (state) => {
        const { setHasHydrated } = state.actions;
        return () => setHasHydrated();
      },
    },
  ),
);
