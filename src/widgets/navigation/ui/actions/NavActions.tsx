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
};

export default function NavActions({
  handleToggleSearch,
  isSearchOpen,
  className = '',
  hideThemeOnMobile = false,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
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
        onToggleSearch={handleToggleSearch}
      />
      <NavCartButton
        cartItemCount={cartItemCount}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        onToggleCart={toggleCart}
      />
      <NavThemeButton
        hideOnMobile={hideThemeOnMobile}
        isDarkOverlayStyle={isDarkOverlayStyle}
        isOverlayStyle={isOverlayStyle}
        onToggleTheme={toggleTheme}
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
        onToggleDropdown={toggleAccountDropdown}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
