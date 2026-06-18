import { IconMoon, IconSun } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

import { NAV_ICON_BUTTON_SURFACE_CLASS } from '../../model/navActions';

type NavThemeButtonProps = {
  hideOnMobile: boolean;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onToggleTheme: () => void;
};

export default function NavThemeButton({
  hideOnMobile,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onToggleTheme,
}: NavThemeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        hideOnMobile ? 'hidden sm:flex' : 'flex',
        isOverlayStyle
          ? 'h-10 w-10 items-center justify-center rounded-xl text-surface transition hover:bg-white/10 sm:h-11 sm:w-11'
          : isDarkOverlayStyle
            ? 'h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-black/5 sm:h-11 sm:w-11'
            : NAV_ICON_BUTTON_SURFACE_CLASS,
      )}
      onClick={onToggleTheme}
      aria-label="테마 전환"
    >
      <IconMoon className="dark:hidden" />
      <IconSun className="hidden dark:block" />
    </button>
  );
}
