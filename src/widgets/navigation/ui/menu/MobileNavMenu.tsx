import Link from 'next/link';

import { IconChevronDown } from '@tabler/icons-react';

import { NOT_IMPLEMENTED_MESSAGE } from '@shared/constants/feedback';
import { toast } from '@shared/lib/toast';
import { cn } from '@shared/lib/utils/style';

import { NAVBAR_CATEGORIES } from '../../model/navCategories';

import NavBarDropdown from './NavBarDropdown';

type MobileNavMenuProps = {
  isOpen: boolean;
  isShopOpen: boolean;
  onToggleShop: () => void;
  onCloseMenu: () => void;
};

export default function MobileNavMenu({
  isOpen,
  isShopOpen,
  onToggleShop,
  onCloseMenu,
}: MobileNavMenuProps) {
  const handleUnavailableMenuClick = () => {
    toast.info(NOT_IMPLEMENTED_MESSAGE);
    onCloseMenu();
  };

  return (
    <div
      className={cn(
        'absolute inset-x-0 top-22.5 z-40 border-b border-line bg-surface px-4 pb-4 pt-3 transition duration-200 sm:px-6 lg:hidden dark:border-dark-border dark:bg-dark-bg',
        isOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-2 opacity-0 pointer-events-none',
      )}
    >
      <ul className="space-y-2">
        <li>
          <Link
            href="/products"
            onClick={onCloseMenu}
            className="block w-full rounded-xl px-3 py-2.5 text-left text-base font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
          >
            전체 상품
          </Link>
        </li>
        {NAVBAR_CATEGORIES.map((category, idx) => (
          <li key={idx}>
            {idx === 0 ? (
              <>
                <button
                  type="button"
                  onClick={onToggleShop}
                  className={cn(
                    'flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-base font-semibold transition-colors',
                    isShopOpen
                      ? 'bg-primary-soft text-primary dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-ink hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-blue-900/30 dark:hover:text-blue-300',
                  )}
                  aria-label="상품 카테고리 펼치기"
                  aria-expanded={isShopOpen}
                  aria-controls="mobile-product-category-menu"
                >
                  <span>{category}</span>
                  <IconChevronDown
                    size={16}
                    className={cn(
                      'transition-transform',
                      isShopOpen ? 'rotate-180' : '',
                    )}
                  />
                </button>
                {isShopOpen && (
                  <div id="mobile-product-category-menu" className="mt-2">
                    <NavBarDropdown
                      variant="mobile"
                      onNavigate={onCloseMenu}
                    />
                  </div>
                )}
              </>
            ) : category === '특가' ? (
              <Link
                href="/products/discounts"
                onClick={onCloseMenu}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-base font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              >
                {category}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleUnavailableMenuClick}
                className="block w-full rounded-xl px-3 py-2.5 text-left text-base font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:text-surface dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              >
                {category}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
