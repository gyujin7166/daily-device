import { useCallback, useEffect } from 'react';
import type { MouseEvent } from 'react';

import type { MyTab } from '@shared/constants/myRoutes';

import { useMyPageShellStore } from '../store/myPageShellStore';

export const useMyPageShellState = (activeTab: MyTab) => {
  const isMobileMenuOpen = useMyPageShellStore(
    (state) => state.isMobileMenuOpen,
  );
  const pendingTab = useMyPageShellStore((state) => state.pendingTab);
  const { closeMobileMenu, resetMyPageShellState, setPendingTab } =
    useMyPageShellStore((state) => state.actions);
  const visualActiveTab = pendingTab ?? activeTab;
  const isContentPending = pendingTab !== null && pendingTab !== activeTab;

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
    [activeTab, setPendingTab],
  );

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileMenu, isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMobileMenu]);

  useEffect(() => {
    if (pendingTab === null) {
      return;
    }

    if (pendingTab === activeTab) {
      setPendingTab(null);
    }
  }, [activeTab, pendingTab, setPendingTab]);

  useEffect(() => () => resetMyPageShellState(), [resetMyPageShellState]);

  return {
    isMobileMenuOpen,
    visualActiveTab,
    isContentPending,
    handleCloseMobileMenu: closeMobileMenu,
    handleTabLinkClick,
  };
};
