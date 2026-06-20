const NAV_ICON_BUTTON_BASE_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-11 sm:w-11';

export const NAV_ICON_BUTTON_SURFACE_CLASS = `${NAV_ICON_BUTTON_BASE_CLASS} text-ink hover:bg-canvas dark:text-surface dark:hover:bg-dark-bg-hover`;

export const NAV_DROPDOWN_ACTION_ITEM_CLASS =
  'flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-dark-bg-hover dark:hover:text-surface';

export const buildLoginCallbackPath = (pathname: string | null) => {
  const currentQuery =
    typeof window === 'undefined' ? '' : window.location.search;
  const currentPath = `${pathname ?? '/'}${currentQuery}`;

  return `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
};
