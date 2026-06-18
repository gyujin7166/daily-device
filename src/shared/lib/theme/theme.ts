export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark';

const getSystemTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return getSystemTheme();
};

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
};
