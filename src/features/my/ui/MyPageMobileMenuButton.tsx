import { IconMenu2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { usePathname } from '@shared/lib/i18n/navigation';

import { getMyTabFromPathname, MY_PAGE_MENU_ITEMS } from '../model/myPageMenu';
import { useMyPageShellStore } from '../model/store/myPageShellStore';

export default function MyPageMobileMenuButton() {
  const t = useTranslations('MyPage.menu');
  const pathname = usePathname();
  const pendingTab = useMyPageShellStore((state) => state.pendingTab);
  const openMobileMenu = useMyPageShellStore(
    (state) => state.actions.openMobileMenu,
  );
  const activeTab = pendingTab ?? getMyTabFromPathname(pathname);
  const activeMenuItem =
    MY_PAGE_MENU_ITEMS.find((item) => item.tab === activeTab) ??
    MY_PAGE_MENU_ITEMS[0];
  const activeLabel = t(activeMenuItem.labelKey);

  return (
    <button
      type="button"
      onClick={openMobileMenu}
      className="inline-flex h-12 items-center gap-2.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-muted shadow-xs transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-bg-hover md:hidden"
      aria-haspopup="dialog"
      aria-controls="my-page-mobile-menu"
      aria-label={t('openActiveMenu', { label: activeLabel })}
    >
      <IconMenu2 size={16} />
      <span>{t('menu')}</span>
    </button>
  );
}
