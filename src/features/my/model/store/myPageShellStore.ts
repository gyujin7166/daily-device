'use client';

import { create } from 'zustand';

import type { MyTab } from '@shared/constants/myRoutes';

type MyPageShellActions = {
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  setPendingTab: (tab: MyTab | null) => void;
  resetMyPageShellState: () => void;
};

type MyPageShellStore = {
  isMobileMenuOpen: boolean;
  pendingTab: MyTab | null;
  actions: MyPageShellActions;
};

export const useMyPageShellStore = create<MyPageShellStore>((set) => ({
  isMobileMenuOpen: false,
  pendingTab: null,
  actions: {
    openMobileMenu: () =>
      set((state) =>
        state.isMobileMenuOpen ? state : { isMobileMenuOpen: true },
      ),
    closeMobileMenu: () =>
      set((state) =>
        state.isMobileMenuOpen ? { isMobileMenuOpen: false } : state,
      ),
    setPendingTab: (pendingTab) =>
      set((state) =>
        state.pendingTab === pendingTab ? state : { pendingTab },
      ),
    resetMyPageShellState: () =>
      set((state) =>
        !state.isMobileMenuOpen && state.pendingTab === null
          ? state
          : { isMobileMenuOpen: false, pendingTab: null },
      ),
  },
}));
