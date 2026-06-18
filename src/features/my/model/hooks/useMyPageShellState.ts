import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

import type { MyTab } from '@shared/constants/myRoutes';

import { MY_PAGE_MENU_ITEMS } from '../myPageMenu';

export const useMyPageShellState = (activeTab: MyTab) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<MyTab | null>(null);
  const visualActiveTab = pendingTab ?? activeTab;
  const isContentPending = pendingTab !== null && pendingTab !== activeTab;
  const activeMenuItem =
    MY_PAGE_MENU_ITEMS.find((item) => item.tab === visualActiveTab) ??
    MY_PAGE_MENU_ITEMS[0];

  const handleOpenMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(true);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleTabLinkClick = useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      tab: MyTab,
      onBeforeNavigate?: () => void,
    ) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      onBeforeNavigate?.();

      if (tab === activeTab) {
        setPendingTab(null);
        return;
      }

      setPendingTab(tab);
    },
    [activeTab],
  );

  const mobileMenuContextValue = useMemo(
    () => ({
      openMobileMenu: handleOpenMobileMenu,
      activeLabel: activeMenuItem.label,
    }),
    [activeMenuItem.label, handleOpenMobileMenu],
  );

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        handleCloseMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleCloseMobileMenu]);

  useEffect(() => {
    if (pendingTab === null) {
      return;
    }

    if (pendingTab === activeTab) {
      setPendingTab(null);
    }
  }, [activeTab, pendingTab]);

  return {
    isMobileMenuOpen,
    visualActiveTab,
    isContentPending,
    mobileMenuContextValue,
    handleCloseMobileMenu,
    handleTabLinkClick,
  };
};
