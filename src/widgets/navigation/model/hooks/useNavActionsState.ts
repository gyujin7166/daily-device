import { useEffect, useState } from 'react';

import { signOut, useSession } from 'next-auth/react';

import { useCartContext } from '@entities/cart/model/context/CartContext';

import { useDropdown } from '@shared/hooks/useDropdown';
import { useThemeMode } from '@shared/hooks/useThemeMode';
import { usePathname, useRouter } from '@shared/lib/i18n/navigation';

import { buildLoginCallbackPath } from '../navActions';

export default function useNavActionsState() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleCart, userCartItems, localCartItems } = useCartContext();
  const { data: session, status } = useSession();
  const { isDropdownOpen, setIsDropdownOpen } = useDropdown();
  const { theme, toggleTheme, mounted } = useThemeMode();
  const [isAvatarLoadFailed, setIsAvatarLoadFailed] = useState(false);
  const cartItemCount = session?.user
    ? userCartItems.length
    : localCartItems.length;
  const avatarSrc = session?.user?.image?.trim() ?? '';
  const shouldShowAvatarImage = avatarSrc.length > 0 && !isAvatarLoadFailed;
  const isDarkMode = mounted && theme === 'dark';

  const toggleAccountDropdown = () => {
    if (status !== 'loading') {
      setIsDropdownOpen((prev) => !prev);
    }
  };

  const closeAccountDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleLogin = () => {
    closeAccountDropdown();
    router.push(buildLoginCallbackPath(pathname));
  };

  const handleSignOut = () => {
    closeAccountDropdown();
    void signOut({ redirect: false }).then(() => {
      router.replace('/');
      router.refresh();
    });
  };

  useEffect(() => {
    setIsAvatarLoadFailed(false);
  }, [avatarSrc]);

  return {
    avatarSrc,
    cartItemCount,
    closeAccountDropdown,
    handleLogin,
    handleSignOut,
    isAvatarLoadFailed,
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
  };
}
