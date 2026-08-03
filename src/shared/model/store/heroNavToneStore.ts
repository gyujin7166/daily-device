'use client';

import { create } from 'zustand';

export type HeroNavTone = 'light' | 'dark';

type HeroNavToneStore = {
  heroNavTone: HeroNavTone;
  setHeroNavTone: (tone: HeroNavTone) => void;
  resetHeroNavTone: () => void;
};

export const useHeroNavToneStore = create<HeroNavToneStore>((set) => ({
  heroNavTone: 'light',
  setHeroNavTone: (heroNavTone) => set({ heroNavTone }),
  resetHeroNavTone: () => set({ heroNavTone: 'light' }),
}));
