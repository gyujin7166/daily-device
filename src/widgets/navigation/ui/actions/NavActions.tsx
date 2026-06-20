import { useEffect, useRef } from 'react';

import { cn } from '@shared/lib/utils/style';

import useNavActionsState from '../../model/hooks/useNavActionsState';
import NavAccountMenu from '../account/NavAccountMenu';

import NavCartButton from './NavCartButton';
import NavSearchButton from './NavSearchButton';
import NavThemeButton from './NavThemeButton';

type NavActionsProps = {
  handleToggleSearch: () => void;
  isSearchOpen: boolean;
  className?: string;
  closeAccountDropdownSignal?: boolean;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onActionClick?: () => void;
};

export default function NavActions({
  handleToggleSearch,
  isSearchOpen,
  className = '',
  closeAccountDropdownSignal = false,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onActionClick,
}: NavActionsProps) {
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const {
    avatarSrc,
    cartItemCount,
    closeAccountDropdown,
    handleLogin,
    handleSignOut,
    isDropdownOpen,
    session,
    setIsAvatarLoadFailed,
    shouldShowAvatarImage,
    status,
    toggleAccountDropdown,
    toggleCart,
    toggleTheme,
  } = useNavActionsState();
  const handleToggleSearchWithClose = () => {
    onActionClick?.();
    closeAccountDropdown();
    handleToggleSearch();
  };
  const handleToggleCart = () => {
    onActionClick?.();
    closeAccountDropdown();
    toggleCart();
  };
  const handleToggleTheme = () => {
    onActionClick?.();
    closeAccountDropdown();
    toggleTheme();
  };
  const handleToggleAccountDropdown = () => {
    onActionClick?.();
    toggleAccountDropdown();
  };

  useEffect(() => {
    if (!isDropdownOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        actionsRef.current?.contains(target)
      ) {
        return;
      }

      closeAccountDropdown();
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAccountDropdown();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [closeAccountDropdown, isDropdownOpen]);

  useEffect(() => {
    if (closeAccountDropdownSignal) {
      closeAccountDropdown();
    }
  }, [closeAccountDropdown, closeAccountDropdownSignal]);

  return (
    <div
      ref={actionsRef}
      className={cn(
        'relative flex items-center justify-center gap-x-1 sm:gap-x-1.5',
        className,
      )}
    >
      <NavSearchButton
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        isSearchOpen={isSearchOpen}
        onToggleSearch={handleToggleSearchWithClose}
      />
      <NavCartButton
        cartItemCount={cartItemCount}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        onToggleCart={handleToggleCart}
      />
      <NavThemeButton
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        onToggleTheme={handleToggleTheme}
      />
      <NavAccountMenu
        avatarSrc={avatarSrc}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isDropdownOpen={isDropdownOpen}
        isOverlayStyle={isOverlayStyle}
        session={session}
        shouldShowAvatarImage={shouldShowAvatarImage}
        status={status}
        onAvatarError={() => setIsAvatarLoadFailed(true)}
        onClose={closeAccountDropdown}
        onLogin={handleLogin}
        onSignOut={handleSignOut}
        onToggleDropdown={handleToggleAccountDropdown}
      />
    </div>
  );
}
