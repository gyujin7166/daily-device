import { useEffect, useState } from 'react';

import {
  applyTheme,
  isThemeMode,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from '@shared/lib/theme/theme';
import type { ThemeMode } from '@shared/lib/theme/theme';

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document !== 'undefined') {
      const rootTheme = document.documentElement.getAttribute('data-theme');
      if (isThemeMode(rootTheme)) {
        return rootTheme;
      }
    }

    return resolveInitialTheme();
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    const rootTheme = document.documentElement.getAttribute('data-theme');

    setTheme(initialTheme);
    if (rootTheme !== initialTheme) {
      applyTheme(initialTheme);
    }

    if (!window.localStorage.getItem(THEME_STORAGE_KEY)) {
      localStorage.setItem(THEME_STORAGE_KEY, initialTheme);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = event.newValue;
      if (!isThemeMode(nextTheme)) {
        return;
      }

      setTheme(nextTheme);
      applyTheme(nextTheme);
    };

    window.addEventListener('storage', handleStorage);
    setMounted(true);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const nextTheme: ThemeMode = prevTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  };

  return { theme, toggleTheme, mounted };
}
