import { useEffect, useRef, useState } from 'react';

type UseSortDropdownStateParams = {
  disabled: boolean;
  mobileSheetOnMobile: boolean;
};

export default function useSortDropdownState({
  disabled,
  mobileSheetOnMobile,
}: UseSortDropdownStateParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobileSheetMode = mobileSheetOnMobile && isMobileViewport;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };
    const handleViewportChange = (event: MediaQueryListEvent) => {
      setIsMobileViewport(event.matches);
    };

    syncViewport();
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        !(event.target instanceof Node) ||
        containerRef.current?.contains(event.target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (disabled && isOpen) {
      setIsOpen(false);
    }
  }, [disabled, isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobileSheetMode) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSheetMode, isOpen]);

  return {
    containerRef,
    isMobileSheetMode,
    isOpen,
    setIsOpen,
  };
}
