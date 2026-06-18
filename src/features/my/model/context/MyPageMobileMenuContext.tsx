import { createContext, useContext } from 'react';

type MyPageMobileMenuContextValue = {
  openMobileMenu: () => void;
  activeLabel: string;
};

export const MyPageMobileMenuContext = createContext<
  MyPageMobileMenuContextValue | undefined
>(undefined);

export function useMyPageMobileMenu() {
  const context = useContext(MyPageMobileMenuContext);

  if (context === undefined) {
    throw new Error('useMyPageMobileMenu must be used within <MyPageShell />.');
  }

  return context;
}
