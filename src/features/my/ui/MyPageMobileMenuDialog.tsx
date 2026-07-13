import type { MouseEvent } from 'react';


import { IconChevronDown, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import type { MyTab } from '@shared/constants/myRoutes';
import { Link } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';

import { MY_PAGE_MENU_ITEMS } from '../model/myPageMenu';

type MyPageMobileMenuDialogProps = {
  isOpen: boolean;
  activeTab: MyTab;
  onClose: () => void;
  onTabLinkClick: (
    event: MouseEvent<HTMLAnchorElement>,
    tab: MyTab,
    onBeforeNavigate?: () => void,
  ) => void;
};

export default function MyPageMobileMenuDialog({
  isOpen,
  activeTab,
  onClose,
  onTabLinkClick,
}: MyPageMobileMenuDialogProps) {
  const t = useTranslations('MyPage.menu');

  return (
    <div
      className={cn(
        'fixed inset-0 z-230 md:hidden',
        isOpen ? '' : 'pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      id="my-page-mobile-menu"
    >
      <button
        type="button"
        aria-label={t('closeMenu')}
        className={cn(
          'absolute inset-0 bg-ink/45 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-surface p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl transition-transform duration-200 dark:border-dark-border dark:bg-dark-panel',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-base font-semibold text-ink dark:text-surface">
            {t('selectMenu')}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
            aria-label={t('close')}
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {MY_PAGE_MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <Link
                key={item.tab}
                href={MY_TAB_PATHS[item.tab]}
                scroll={false}
                onClick={(event) => onTabLinkClick(event, item.tab, onClose)}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3 py-3 font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary dark:bg-primary-soft dark:text-primary'
                    : 'text-ink hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-primary-soft dark:hover:text-primary',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-base font-semibold">
                    {t(item.labelKey)}
                  </span>
                </span>
                <IconChevronDown size={16} className="-rotate-90 opacity-70" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
