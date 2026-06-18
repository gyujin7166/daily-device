import { IconMenu2 } from '@tabler/icons-react';

import { useMyPageMobileMenu } from '../model/context/MyPageMobileMenuContext';

export default function MyPageMobileMenuButton() {
  const { openMobileMenu, activeLabel } = useMyPageMobileMenu();

  return (
    <button
      type="button"
      onClick={openMobileMenu}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3 text-sm font-semibold text-muted shadow-xs transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-bg-hover md:hidden"
      aria-haspopup="dialog"
      aria-controls="my-page-mobile-menu"
      aria-label={`${activeLabel} 메뉴 열기`}
    >
      <IconMenu2 size={15} />
      <span>메뉴</span>
    </button>
  );
}
