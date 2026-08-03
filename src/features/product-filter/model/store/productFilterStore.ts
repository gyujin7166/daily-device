'use client';

import type { SetStateAction } from 'react';

import { create } from 'zustand';

import type { ProductFilterCheckboxStates } from '../productFilter';

type ProductFilterActions = {
  setVisibleFilter: (next: SetStateAction<boolean>) => void;
  setCheckboxStates: (
    next: SetStateAction<ProductFilterCheckboxStates>,
  ) => void;
  resetProductFilterState: () => void;
};

type ProductFilterStore = {
  visibleFilter: boolean;
  checkboxStates: ProductFilterCheckboxStates;
  actions: ProductFilterActions;
};

const areSameCheckboxStates = (
  previous: ProductFilterCheckboxStates,
  next: ProductFilterCheckboxStates,
) => {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  return (
    previousKeys.length === nextKeys.length &&
    previousKeys.every((key) => previous[+key] === next[+key])
  );
};

export const selectHasCheckedProductFilters = (state: ProductFilterStore) =>
  Object.values(state.checkboxStates).some(Boolean);

export const useProductFilterStore = create<ProductFilterStore>((set) => ({
  visibleFilter: true,
  checkboxStates: {},
  actions: {
    setVisibleFilter: (next) =>
      set((state) => {
        const visibleFilter =
          typeof next === 'function' ? next(state.visibleFilter) : next;

        return visibleFilter === state.visibleFilter
          ? state
          : { visibleFilter };
      }),
    setCheckboxStates: (next) =>
      set((state) => {
        const checkboxStates =
          typeof next === 'function' ? next(state.checkboxStates) : next;

        return areSameCheckboxStates(state.checkboxStates, checkboxStates)
          ? state
          : { checkboxStates };
      }),
    resetProductFilterState: () =>
      set((state) =>
        state.visibleFilter && Object.keys(state.checkboxStates).length === 0
          ? state
          : { visibleFilter: true, checkboxStates: {} },
      ),
  },
}));
