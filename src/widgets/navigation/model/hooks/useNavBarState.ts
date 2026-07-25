import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

const DROPDOWN_OPEN_SCROLL_COOLDOWN_MS = 140;

type DropdownOpenLockReason = 'navigate' | 'scroll' | null;

type UseNavBarStateParams = {
  headerVisible: boolean;
  routerPath: string;
  setIsDropdownOpen: Dispatch<SetStateAction<boolean>>;
  handleToggleSearch: () => void;
};

export default function useNavBarState({
  headerVisible,
  routerPath,
  setIsDropdownOpen,
  handleToggleSearch,
}: UseNavBarStateParams) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollAtRef = useRef(0);
  const isShopHoveredRef = useRef(false);
  const dropdownOpenLockReasonRef = useRef<DropdownOpenLockReason>(null);

  const scheduleDropdownOpen = () => {
    if (!headerVisible || dropdownOpenLockReasonRef.current) {
      return;
    }

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }

    const elapsedFromLastScroll = performance.now() - lastScrollAtRef.current;
    const waitMs = Math.max(
      0,
      DROPDOWN_OPEN_SCROLL_COOLDOWN_MS - elapsedFromLastScroll,
    );

    if (waitMs <= 0) {
      setIsDropdownOpen(true);
      return;
    }

    hoverOpenTimerRef.current = setTimeout(() => {
      if (isShopHoveredRef.current && headerVisible) {
        setIsDropdownOpen(true);
      }
      hoverOpenTimerRef.current = null;
    }, waitMs);
  };

  const handleMouseEnter = () => {
    isShopHoveredRef.current = true;
    dropdownOpenLockReasonRef.current = null;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    scheduleDropdownOpen();
  };

  const handleMouseLeave = () => {
    isShopHoveredRef.current = false;
    dropdownOpenLockReasonRef.current = null;

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }

    timerRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
  };

  const handleMouseMove = () => {
    if (
      !isShopHoveredRef.current ||
      dropdownOpenLockReasonRef.current !== 'scroll'
    ) {
      return;
    }

    const elapsedFromLastScroll = performance.now() - lastScrollAtRef.current;
    if (elapsedFromLastScroll < DROPDOWN_OPEN_SCROLL_COOLDOWN_MS) {
      return;
    }

    dropdownOpenLockReasonRef.current = null;
    scheduleDropdownOpen();
  };

  const handleDropdownNavigate = () => {
    dropdownOpenLockReasonRef.current = 'navigate';

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (hoverOpenTimerRef.current) {
      clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }

    setIsDropdownOpen(false);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileShopOpen(false);
  };

  const handleToggleMobileMenu = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen((prev) => {
      const next = !prev;
      if (!next) {
        setIsMobileShopOpen(false);
      }
      return next;
    });
  };

  const handleToggleMobileShop = () => {
    setIsMobileShopOpen((prev) => !prev);
  };

  const handleToggleSearchWithClose = () => {
    handleCloseMobileMenu();
    handleToggleSearch();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (hoverOpenTimerRef.current) {
        clearTimeout(hoverOpenTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileShopOpen(false);
  }, [routerPath]);

  useEffect(() => {
    const handleScroll = () => {
      const now = performance.now();
      lastScrollAtRef.current = now;

      if (!isShopHoveredRef.current) {
        return;
      }

      dropdownOpenLockReasonRef.current = 'scroll';

      if (hoverOpenTimerRef.current) {
        clearTimeout(hoverOpenTimerRef.current);
        hoverOpenTimerRef.current = null;
      }

      setIsDropdownOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsDropdownOpen]);

  return {
    isMobileMenuOpen,
    isMobileShopOpen,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleDropdownNavigate,
    handleCloseMobileMenu,
    handleToggleMobileMenu,
    handleToggleMobileShop,
    handleToggleSearchWithClose,
  };
}
