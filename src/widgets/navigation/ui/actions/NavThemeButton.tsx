import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

import { NAV_ICON_BUTTON_SURFACE_CLASS } from '../../model/navActions';

type NavThemeButtonProps = {
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onToggleTheme: () => void;
};

export default function NavThemeButton({
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onToggleTheme,
}: NavThemeButtonProps) {
  const t = useTranslations('Navigation.actions');

  return (
    <button
      type="button"
      className={cn(
        'flex',
        isOverlayStyle
          ? 'h-10 w-10 items-center justify-center rounded-xl text-surface transition hover:bg-white/10 sm:h-11 sm:w-11'
          : isDarkOverlayStyle
            ? 'h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-black/5 sm:h-11 sm:w-11'
            : NAV_ICON_BUTTON_SURFACE_CLASS,
      )}
      onClick={onToggleTheme}
      aria-label={t('theme')}
    >
      <IconMoon className="dark:hidden" />
      <IconSun className="hidden dark:block" />
    </button>
  );
}
