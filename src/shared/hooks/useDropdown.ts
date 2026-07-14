import { useState, useEffect, useRef } from 'react';

import { usePathname } from '@shared/lib/i18n/navigation';

export const useDropdown = () => {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isDropdownOpenRef = useRef(isDropdownOpen);
  useEffect(() => {
    isDropdownOpenRef.current = isDropdownOpen;
  }, [isDropdownOpen]);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isDropdownOpenRef.current) {
        return;
      }

      setIsDropdownOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { isDropdownOpen, setIsDropdownOpen };
};
