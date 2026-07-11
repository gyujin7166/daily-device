import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';

type NavSearchButtonProps = {
  isSearchOpen: boolean;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onToggleSearch: () => void;
};

export default function NavSearchButton({
  isSearchOpen,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onToggleSearch,
}: NavSearchButtonProps) {
  const t = useTranslations('Navigation.actions');

  return (
    <button
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-colors sm:h-11 sm:w-11',
        isSearchOpen
          ? 'bg-primary-soft dark:bg-blue-900/30 text-primary'
          : isOverlayStyle
            ? 'text-surface hover:bg-white/10'
            : isDarkOverlayStyle
              ? 'text-ink hover:bg-black/5'
              : 'text-ink dark:text-surface hover:bg-canvas dark:hover:bg-dark-bg-hover',
      )}
      onClick={onToggleSearch}
      aria-label={t('search')}
      aria-pressed={isSearchOpen}
    >
      <IconSearch />
    </button>
  );
}
