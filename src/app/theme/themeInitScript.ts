import {
  THEME_LOCALE_SWITCH_CLASS,
  THEME_STORAGE_KEY,
} from '@shared/lib/theme/theme';

export const themeInitScript = `(() => {
  try {
    const key = '${THEME_STORAGE_KEY}';
    const root = document.documentElement;
    const resolveTheme = () => {
      const stored = localStorage.getItem(key);
      return stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    };
    const syncTheme = () => {
      const theme = resolveTheme();
      root.setAttribute('data-theme', theme);
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
      root.setAttribute('data-theme-ready', '');
    };

    syncTheme();

    if (!window.__dailyDeviceThemeObserver) {
      window.__dailyDeviceThemeObserver = new MutationObserver(() => {
        const theme = resolveTheme();
        const isLocaleThemeTransitionActive =
          window.__dailyDeviceLocaleThemeTransitionToken !== undefined;
        const isThemeSynced =
          root.getAttribute('data-theme') === theme &&
          root.classList.contains('dark') === (theme === 'dark') &&
          root.style.colorScheme === theme &&
          root.hasAttribute('data-theme-ready') &&
          (!isLocaleThemeTransitionActive ||
            root.classList.contains('${THEME_LOCALE_SWITCH_CLASS}'));

        if (!isThemeSynced) {
          const guardToken = (window.__dailyDeviceThemeGuardToken ?? 0) + 1;
          window.__dailyDeviceThemeGuardToken = guardToken;
          root.classList.add('theme-syncing');
          if (isLocaleThemeTransitionActive) {
            root.classList.add('${THEME_LOCALE_SWITCH_CLASS}');
          }
          syncTheme();
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              if (window.__dailyDeviceThemeGuardToken === guardToken) {
                root.classList.remove('theme-syncing');
              }
            });
          });
        }
      });
      window.__dailyDeviceThemeObserver.observe(root, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-theme-ready', 'style'],
      });
    }
  } catch {}
})();`;
