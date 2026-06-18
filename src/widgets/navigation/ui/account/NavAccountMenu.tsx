import { IconUser } from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

import { NAV_ICON_BUTTON_SURFACE_CLASS } from '../../model/navActions';

import NavAccountAvatar from './NavAccountAvatar';
import NavAccountDropdown from './NavAccountDropdown';

import type { Session } from 'next-auth';

type NavAccountMenuProps = {
  avatarSrc: string;
  isDarkMode: boolean;
  isDropdownOpen: boolean;
  mounted: boolean;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  session: Session | null;
  shouldShowAvatarImage: boolean;
  status: 'authenticated' | 'loading' | 'unauthenticated';
  onAvatarError: () => void;
  onClose: () => void;
  onLogin: () => void;
  onSignOut: () => void;
  onToggleDropdown: () => void;
  onToggleTheme: () => void;
};

export default function NavAccountMenu({
  avatarSrc,
  isDarkMode,
  isDropdownOpen,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  mounted,
  session,
  shouldShowAvatarImage,
  status,
  onAvatarError,
  onClose,
  onLogin,
  onSignOut,
  onToggleDropdown,
  onToggleTheme,
}: NavAccountMenuProps) {
  return (
    <div className="relative">
      {session?.user ? (
        <button
          onClick={onToggleDropdown}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl transition sm:h-11 sm:w-11',
            isOverlayStyle
              ? 'text-surface hover:bg-white/10'
              : isDarkOverlayStyle
                ? 'text-ink hover:bg-black/5'
                : 'hover:bg-canvas dark:hover:bg-dark-bg-hover',
          )}
          aria-label="사용자 메뉴 열기"
          aria-expanded={isDropdownOpen}
        >
          <NavAccountAvatar
            avatarSrc={avatarSrc}
            shouldShowAvatarImage={shouldShowAvatarImage}
            onAvatarError={onAvatarError}
          />
        </button>
      ) : (
        <button
          className={
            isOverlayStyle
              ? 'flex h-10 w-10 items-center justify-center rounded-xl text-surface transition hover:bg-white/10 sm:h-11 sm:w-11'
              : isDarkOverlayStyle
                ? 'flex h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-black/5 sm:h-11 sm:w-11'
                : NAV_ICON_BUTTON_SURFACE_CLASS
          }
          onClick={onToggleDropdown}
          disabled={status === 'loading'}
          aria-label="사용자 메뉴 열기"
          aria-expanded={isDropdownOpen}
        >
          <IconUser />
        </button>
      )}
      <NavAccountDropdown
        avatarSrc={avatarSrc}
        isDarkMode={isDarkMode}
        isDropdownOpen={isDropdownOpen}
        mounted={mounted}
        session={session}
        shouldShowAvatarImage={shouldShowAvatarImage}
        onAvatarError={onAvatarError}
        onClose={onClose}
        onLogin={onLogin}
        onSignOut={onSignOut}
        onToggleTheme={onToggleTheme}
      />
    </div>
  );
}
