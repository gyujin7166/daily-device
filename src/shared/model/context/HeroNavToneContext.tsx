'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type HeroNavTone = 'light' | 'dark';

type HeroNavToneContextValue = {
  heroNavTone: HeroNavTone;
  setHeroNavTone: (tone: HeroNavTone) => void;
  resetHeroNavTone: () => void;
};

const HeroNavToneContext = createContext<HeroNavToneContextValue | undefined>(
  undefined,
);

export const useHeroNavToneContext = () => {
  const context = useContext(HeroNavToneContext);

  if (context === undefined) {
    throw new Error(
      'useHeroNavToneContext must be used within a HeroNavToneProvider',
    );
  }

  return context;
};

export function HeroNavToneProvider({ children }: { children: ReactNode }) {
  const [heroNavTone, setHeroNavTone] = useState<HeroNavTone>('light');
  const resetHeroNavTone = useCallback(() => setHeroNavTone('light'), []);
  const value = useMemo(
    () => ({
      heroNavTone,
      setHeroNavTone,
      resetHeroNavTone,
    }),
    [heroNavTone, resetHeroNavTone],
  );

  return (
    <HeroNavToneContext.Provider value={value}>
      {children}
    </HeroNavToneContext.Provider>
  );
}
