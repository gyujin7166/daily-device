import { THEME_STORAGE_KEY } from '@shared/lib/theme/theme';

export const themeInitScript = `(() => {
  try {
    const key = '${THEME_STORAGE_KEY}';
    const stored = localStorage.getItem(key);
    const theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    root.setAttribute('data-theme-ready', '');
  } catch {}
})();`;
