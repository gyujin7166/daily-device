import { useEffect, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import { IconCheck, IconLanguage } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Locale } from '@shared/config/i18n/routing';
import { useDropdown } from '@shared/hooks/useDropdown';
import { usePathname, useRouter } from '@shared/lib/i18n/navigation';
import {
  finishLocaleThemeTransition,
  startLocaleThemeTransition,
} from '@shared/lib/theme/theme';
import { cn } from '@shared/lib/utils/style';

import { NAV_DROPDOWN_ACTION_ITEM_CLASS } from '../../model/navActions';

type NavLocaleSwitcherProps = {
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onOpenDropdown: () => void;
  onSelectLocale: () => void;
};

const localeOptions = [
  { locale: 'ko', label: '한국어' },
  { locale: 'en', label: 'English' },
] satisfies {
  locale: Locale;
  label: string;
}[];

export default function NavLocaleSwitcher({
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onOpenDropdown,
  onSelectLocale,
}: NavLocaleSwitcherProps) {
  const t = useTranslations('Navigation.localeSwitcher');
  const locale = useLocale() as Locale;
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDropdownOpen, setIsDropdownOpen } = useDropdown();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const queryString = searchParams?.toString();
  const href = queryString ? `${pathname}?${queryString}` : pathname;
  const label = t('label');

  const handleToggleDropdown = () => {
    onOpenDropdown();
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelectLocale = (nextLocale: Locale) => {
    setIsDropdownOpen(false);

    if (nextLocale === locale) {
      return;
    }

    onSelectLocale();
    startLocaleThemeTransition();
    router.replace(href, { locale: nextLocale, scroll: false });
  };

  useEffect(() => {
    finishLocaleThemeTransition();
  }, [locale]);

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && dropdownRef.current?.contains(target)) {
        return;
      }

      setIsDropdownOpen(false);
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className={cn(
          'flex h-10 w-12 items-center justify-center gap-1.5 rounded-xl text-xs font-bold uppercase tracking-normal transition sm:h-11 sm:w-13',
          isOverlayStyle
            ? 'text-surface hover:bg-white/10'
            : isDarkOverlayStyle
              ? 'text-ink hover:bg-black/5'
              : 'text-ink hover:bg-canvas dark:text-surface dark:hover:bg-dark-bg-hover',
        )}
        onClick={handleToggleDropdown}
        aria-label={label}
        aria-expanded={isDropdownOpen}
        aria-haspopup="menu"
        title={label}
      >
        <IconLanguage size={18} stroke={2} />
        <span>{locale}</span>
      </button>
      <div
        role="menu"
        className={cn(
          'absolute right-0 top-full z-20 mt-3 w-48 rounded-2xl border border-line bg-surface p-3 shadow-2xl transition duration-200 ease-out dark:border-dark-border dark:bg-dark-bg',
          isDropdownOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
      >
        <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-muted dark:text-dark-muted">
          {t('title')}
        </div>
        <div className="grid gap-1">
          {localeOptions.map((item) => {
            const isSelected = item.locale === locale;

            return (
              <button
                key={item.locale}
                type="button"
                className={cn(
                  NAV_DROPDOWN_ACTION_ITEM_CLASS,
                  isSelected &&
                    'bg-primary-soft text-primary dark:bg-dark-bg-hover dark:text-surface',
                )}
                onClick={() => handleSelectLocale(item.locale)}
                aria-current={isSelected ? 'true' : undefined}
                role="menuitem"
              >
                <span>{item.label}</span>
                <span className="flex items-center gap-2 text-xs uppercase text-muted dark:text-dark-muted">
                  {item.locale}
                  {isSelected ? <IconCheck size={16} stroke={2} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
