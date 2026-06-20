'use client';
import type { MouseEvent } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useSession } from 'next-auth/react';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import type { MyTab } from '@shared/constants/myRoutes';
import {
  getUserDisplayName,
  getUserInitial,
} from '@shared/lib/auth/userDisplay';
import { cn } from '@shared/lib/utils/style';

import { MY_PAGE_MENU_ITEMS } from '../model/myPageMenu';

type MyPageTabNavigationProps = {
  activeTab: MyTab;
  variant: 'tablet' | 'desktop';
  onTabLinkClick: (event: MouseEvent<HTMLAnchorElement>, tab: MyTab) => void;
};

export default function MyPageTabNavigation({
  activeTab,
  variant,
  onTabLinkClick,
}: MyPageTabNavigationProps) {
  const { data: session, status } = useSession();
  const isSessionLoading = status === 'loading';
  const userName = getUserDisplayName(session?.user);
  const userEmail = session?.user?.email ?? '';
  const userImage = session?.user?.image?.trim() ?? '';
  const avatarLabel = getUserInitial(session?.user);

  if (variant === 'tablet') {
    return (
      <div className="mb-5 hidden md:block lg:hidden">
        <div className="rounded-2xl border border-line bg-surface p-2 shadow-xs dark:border-dark-border dark:bg-dark-bg">
          <div className="flex gap-2 overflow-x-auto">
            {MY_PAGE_MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.tab;
              const Icon = item.icon;

              return (
                <Link
                  key={item.tab}
                  href={MY_TAB_PATHS[item.tab]}
                  scroll={false}
                  onClick={(event) => onTabLinkClick(event, item.tab)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-soft text-primary dark:bg-blue-900/30'
                      : 'text-muted hover:bg-canvas dark:text-dark-muted dark:hover:bg-dark-bg-hover',
                  )}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden self-start rounded-2xl border border-line bg-surface shadow-xs lg:block dark:border-dark-border dark:bg-dark-panel">
      <div className="flex flex-col px-3 py-3">
        {isSessionLoading ? (
          <div className="mb-5 flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-canvas p-3.5 shadow-xs dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-line dark:bg-dark-border" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="mt-2 h-3.5 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            </div>
          </div>
        ) : (
          <div className="mb-5 flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-canvas p-3.5 shadow-xs dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface text-base font-bold text-primary dark:border-dark-bg-hover dark:bg-dark-panel-deep">
              {userImage ? (
                <Image
                  src={userImage}
                  alt={userName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                avatarLabel.toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink dark:text-surface">
                {userName}
              </p>
              <p className="text-sm text-muted dark:text-dark-muted">
                {userEmail}
              </p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2">
          {MY_PAGE_MENU_ITEMS.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;

            return (
              <Link
                key={item.tab}
                href={MY_TAB_PATHS[item.tab]}
                scroll={false}
                onClick={(event) => onTabLinkClick(event, item.tab)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-base font-medium transition-colors',
                  isActive
                    ? 'bg-primary-soft text-primary dark:bg-blue-900/30'
                    : 'text-muted hover:bg-line dark:text-dark-muted dark:hover:bg-dark-bg-hover',
                )}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
