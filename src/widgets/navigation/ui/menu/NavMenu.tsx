import Link from 'next/link';

import { IconChevronDown } from '@tabler/icons-react';

import { NOT_IMPLEMENTED_MESSAGE } from '@shared/constants/feedback';
import { toast } from '@shared/lib/toast';
import { cn } from '@shared/lib/utils/style';

import { NAVBAR_CATEGORIES } from '../../model/navCategories';

import NavBarDropdown from './NavBarDropdown';

type NavigationMenuProps = {
  isDropdownOpen: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  handleMouseMove?: () => void;
  isOverlayStyle?: boolean;
  isDarkOverlayStyle?: boolean;
};

export default function NavMenu({
  isDropdownOpen,
  handleMouseEnter,
  handleMouseLeave,
  handleMouseMove,
  isOverlayStyle = false,
  isDarkOverlayStyle = false,
}: NavigationMenuProps) {
  const handleUnavailableMenuClick = () => {
    toast.info(NOT_IMPLEMENTED_MESSAGE);
  };

  return (
    <div className="relative h-full">
      <ul
        className={cn(
          'flex items-stretch gap-1 text-base font-semibold',
          isOverlayStyle || isDarkOverlayStyle
            ? isOverlayStyle
              ? 'text-surface'
              : 'text-ink'
            : 'text-ink dark:text-surface',
        )}
      >
        {NAVBAR_CATEGORIES.map((category, idx) => {
          const menuItemClassName = cn(
            'relative inline-flex h-full items-center gap-1 px-4 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-center after:scale-x-0 after:bg-primary after:transition-transform after:duration-200',
            idx === 0 && isDropdownOpen
              ? 'text-primary after:scale-x-100'
              : cn(
                  'group-hover:after:scale-x-100',
                  isOverlayStyle
                    ? 'hover:text-surface/80'
                    : isDarkOverlayStyle
                      ? 'hover:text-ink/70'
                      : 'hover:text-primary',
                ),
          );

          return (
            <li
              key={idx}
              className="group relative flex h-22.5 items-center"
              onMouseEnter={idx === 0 ? handleMouseEnter : undefined}
              onMouseLeave={idx === 0 ? handleMouseLeave : undefined}
              onMouseMove={idx === 0 ? handleMouseMove : undefined}
            >
              {idx === 0 ? (
                <Link href="/products" className={menuItemClassName}>
                  {category}
                  <IconChevronDown
                    size={14}
                    className={cn(
                      'transition-transform',
                      isDropdownOpen ? 'rotate-180' : '',
                    )}
                  />
                </Link>
              ) : category === '특가' ? (
                <Link
                  href="/products/discounts"
                  className={menuItemClassName}
                >
                  {category}
                </Link>
              ) : (
                <button
                  type="button"
                  className={menuItemClassName}
                  onClick={handleUnavailableMenuClick}
                >
                  {category}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {isDropdownOpen && (
        <NavBarDropdown
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      )}
    </div>
  );
}
