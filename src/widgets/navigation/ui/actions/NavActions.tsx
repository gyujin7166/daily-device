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
  hideThemeOnMobile?: boolean;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
  onActionClick?: () => void;
};

export default function NavActions({
  handleToggleSearch,
  isSearchOpen,
  className = '',
  hideThemeOnMobile = false,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
  onActionClick,
}: NavActionsProps) {
  const {
    avatarSrc,
    cartItemCount,
    closeAccountDropdown,
    handleLogin,
    handleSignOut,
    isDarkMode,
    isDropdownOpen,
    mounted,
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

  return (
    <div
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
        hideOnMobile={hideThemeOnMobile}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        onToggleTheme={handleToggleTheme}
      />
      <NavAccountMenu
        avatarSrc={avatarSrc}
        isDarkMode={isDarkMode}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isDropdownOpen={isDropdownOpen}
        isOverlayStyle={isOverlayStyle}
        mounted={mounted}
        session={session}
        shouldShowAvatarImage={shouldShowAvatarImage}
        status={status}
        onAvatarError={() => setIsAvatarLoadFailed(true)}
        onClose={closeAccountDropdown}
        onLogin={handleLogin}
        onSignOut={handleSignOut}
        onToggleDropdown={handleToggleAccountDropdown}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
