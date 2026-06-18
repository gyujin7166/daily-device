import Link from 'next/link';

import { IconMoon, IconSun, IconUser } from '@tabler/icons-react';

import { getUserDisplayName } from '@shared/lib/auth/userDisplay';
import { cn } from '@shared/lib/utils/style';

import {
  NAV_DROPDOWN_ACTION_ITEM_CLASS,
  NAV_MOBILE_THEME_ACTION_ITEM_CLASS,
} from '../../model/navActions';

import NavAccountAvatar from './NavAccountAvatar';

import type { Session } from 'next-auth';

type NavAccountDropdownProps = {
  avatarSrc: string;
  isDarkMode: boolean;
  isDropdownOpen: boolean;
  mounted: boolean;
  session: Session | null;
  shouldShowAvatarImage: boolean;
  onAvatarError: () => void;
  onClose: () => void;
  onLogin: () => void;
  onSignOut: () => void;
  onToggleTheme: () => void;
};

export default function NavAccountDropdown({
  avatarSrc,
  isDarkMode,
  isDropdownOpen,
  mounted,
  session,
  shouldShowAvatarImage,
  onAvatarError,
  onClose,
  onLogin,
  onSignOut,
  onToggleTheme,
}: NavAccountDropdownProps) {
  const userDisplayName = getUserDisplayName(session?.user);

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-20 mt-3 w-[90vw] max-w-80 rounded-2xl border border-line bg-surface p-4 shadow-2xl transition duration-200 ease-out sm:w-70 dark:border-dark-border dark:bg-dark-bg',
        isDropdownOpen
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-2 pointer-events-none',
      )}
    >
      {session?.user ? (
        <>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg-hover">
            <NavAccountAvatar
              avatarSrc={avatarSrc}
              shouldShowAvatarImage={shouldShowAvatarImage}
              size="md"
              onAvatarError={onAvatarError}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink dark:text-surface">
                {userDisplayName}
              </div>
              {session.user.email ? (
                <div className="truncate text-xs text-muted dark:text-dark-muted">
                  {session.user.email}
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <Link
              href="/my"
              className={NAV_DROPDOWN_ACTION_ITEM_CLASS}
              onClick={onClose}
            >
              <span>마이페이지</span>
              <span className="text-muted dark:text-dark-muted">→</span>
            </Link>
            <button
              onClick={onSignOut}
              className={NAV_DROPDOWN_ACTION_ITEM_CLASS}
            >
              <span>로그아웃</span>
              <span className="text-muted dark:text-dark-muted">→</span>
            </button>
            <MobileThemeAction
              isDarkMode={isDarkMode}
              mounted={mounted}
              onToggleTheme={onToggleTheme}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface dark:border-dark-bg-hover dark:bg-dark-panel-deep">
              <IconUser className="h-5 w-5 text-muted dark:text-dark-muted" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink dark:text-surface">
                로그인 필요
              </div>
              <div className="text-xs text-muted dark:text-dark-muted">
                주문과 배송을 확인하세요.
              </div>
            </div>
          </div>
          <div className="mt-4">
            <MobileThemeAction
              className="mb-2 w-full text-left"
              isDarkMode={isDarkMode}
              mounted={mounted}
              onToggleTheme={onToggleTheme}
            />
            <button
              onClick={onLogin}
              className="flex w-full items-center justify-between rounded-xl border border-primary bg-primary-soft px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-surface dark:bg-blue-900/30 dark:text-blue-300"
            >
              로그인
              <span className="text-muted dark:text-dark-muted">→</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

type MobileThemeActionProps = {
  className?: string;
  isDarkMode: boolean;
  mounted: boolean;
  onToggleTheme: () => void;
};

function MobileThemeAction({
  className = '',
  isDarkMode,
  mounted,
  onToggleTheme,
}: MobileThemeActionProps) {
  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-pressed={isDarkMode}
      disabled={!mounted}
      className={cn(className, NAV_MOBILE_THEME_ACTION_ITEM_CLASS)}
    >
      <span>{isDarkMode ? '라이트 모드' : '다크 모드'}</span>
      {isDarkMode ? (
        <IconSun size={17} className="text-primary" />
      ) : (
        <IconMoon size={17} className="text-muted dark:text-dark-muted" />
      )}
    </button>
  );
}
