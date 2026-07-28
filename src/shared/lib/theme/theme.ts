export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_LOCALE_SWITCH_CLASS = 'theme-locale-switching';

type ThemeTransitionWindow = Window & {
  __dailyDeviceLocaleThemeTransitionToken?: number;
};

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

export const startLocaleThemeTransition = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const transitionWindow = window as ThemeTransitionWindow;
  const transitionToken =
    (transitionWindow.__dailyDeviceLocaleThemeTransitionToken ?? 0) + 1;
  transitionWindow.__dailyDeviceLocaleThemeTransitionToken = transitionToken;
  document.documentElement.classList.add(THEME_LOCALE_SWITCH_CLASS);

  window.setTimeout(() => {
    if (
      transitionWindow.__dailyDeviceLocaleThemeTransitionToken !==
      transitionToken
    ) {
      return;
    }

    transitionWindow.__dailyDeviceLocaleThemeTransitionToken = undefined;
    document.documentElement.classList.remove(THEME_LOCALE_SWITCH_CLASS);
  }, 5000);
};

export const finishLocaleThemeTransition = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const transitionWindow = window as ThemeTransitionWindow;
  const transitionToken =
    transitionWindow.__dailyDeviceLocaleThemeTransitionToken;

  if (transitionToken === undefined) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (
        transitionWindow.__dailyDeviceLocaleThemeTransitionToken !==
        transitionToken
      ) {
        return;
      }

      transitionWindow.__dailyDeviceLocaleThemeTransitionToken = undefined;
      document.documentElement.classList.remove(THEME_LOCALE_SWITCH_CLASS);
    });
  });
};
