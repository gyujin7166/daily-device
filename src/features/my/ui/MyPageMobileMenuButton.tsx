import { IconMenu2 } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { useMyPageMobileMenu } from '../model/context/MyPageMobileMenuContext';

export default function MyPageMobileMenuButton() {
  const t = useTranslations('MyPage.menu');
  const { openMobileMenu, activeLabel } = useMyPageMobileMenu();

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
