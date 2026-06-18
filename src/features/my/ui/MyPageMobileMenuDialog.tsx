import type { MouseEvent } from 'react';

import Link from 'next/link';

import { IconChevronDown, IconX } from '@tabler/icons-react';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import type { MyTab } from '@shared/constants/myRoutes';
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
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-80 md:hidden"
      role="dialog"
      aria-modal="true"
      id="my-page-mobile-menu"
    >
      <button
        type="button"
        aria-label="마이페이지 메뉴 닫기"
        className="absolute inset-0 bg-ink/35"
        onClick={onClose}
      />

      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-line bg-surface px-5 pb-6 pt-4 shadow-xl dark:border-dark-border dark:bg-dark-bg">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-ink dark:text-surface">
              메뉴 선택
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:bg-canvas hover:text-ink dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
            aria-label="닫기"
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
                  'flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors',
                  isActive
                    ? 'border-primary/25 bg-primary-soft text-primary dark:bg-blue-900/30'
                    : 'border-line bg-surface text-ink hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-base font-semibold">{item.label}</span>
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
