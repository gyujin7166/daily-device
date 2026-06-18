import Link from 'next/link';

import type { CategoryItems } from '@entities/category/model/types';
import { useCategory } from '@entities/product/queries/useCategory';

import { getCategoryHref } from '@shared/lib/routes/productRoutes';

import CategoryItem from './CategoryItem';

type NavBarDropdownProps = {
  handleMouseEnter?: () => void;
  handleMouseLeave?: () => void;
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
};

export default function NavBarDropdown({
  handleMouseEnter,
  handleMouseLeave,
  variant = 'desktop',
  onNavigate,
}: NavBarDropdownProps) {
  const { data: categories, isLoading: categoryIsLoading } = useCategory();

  if (variant === 'mobile') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-xs dark:border-dark-border dark:bg-dark-bg">
        {categoryIsLoading ? (
          <MobileDropdownSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {categories?.map((category: CategoryItems) => (
              <div
                key={category.id}
                className="rounded-xl border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg"
              >
                <p className="mb-2 text-base font-bold text-ink dark:text-surface">
                  {category.name_ko}
                </p>
                <ul className="space-y-1 text-sm font-medium text-muted dark:text-dark-muted">
                  {category.children.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={getCategoryHref(item.slug)}
                        className="block rounded-lg px-2 py-1 transition-colors hover:bg-primary-soft hover:text-primary dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                        onClick={onNavigate}
                      >
                        {item.name_ko}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-22.5 z-30 w-full py-4">
      <div
        className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ul className="relative w-full">
          <li className="h-full">
            <div className="h-full overflow-hidden rounded-3xl border border-line bg-surface p-6 lg:p-7 shadow-2xl dark:border-dark-border dark:bg-dark-bg">
              <div className="w-full">
                {categoryIsLoading ? (
                  <DesktopDropdownSkeleton />
                ) : (
                  <div className="flex w-full flex-wrap gap-y-8 leading-6">
                    {categories?.map((category: CategoryItems) => (
                      <CategoryItem key={category.id} category={category} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

function MobileDropdownSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`mobile-nav-skeleton-${index}`}
          className="rounded-xl border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg"
        >
          <div className="mb-3 h-5 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((__, row) => (
              <div
                key={`mobile-nav-skeleton-row-${index}-${row}`}
                className="h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopDropdownSkeleton() {
  const desktopRowCounts = [3, 3, 4, 4, 4];

  return (
    <div className="flex w-full flex-wrap gap-y-8 leading-6">
      {desktopRowCounts.map((rowCount, index) => (
        <div
          key={`desktop-nav-skeleton-${index}`}
          className="relative w-full break-inside-avoid px-2 md:w-1/2 md:px-3 lg:w-1/3"
        >
          <div className="mx-auto mb-4 hidden h-20 w-full animate-pulse overflow-hidden rounded-xl bg-line lg:block dark:bg-dark-bg-hover" />
          <div>
            <div className="px-2 pb-3">
              <div className="h-6 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
            </div>
            <ul className="text-sm font-medium">
              {Array.from({ length: rowCount }).map((__, row) => (
                <li
                  key={`desktop-nav-skeleton-row-${index}-${row}`}
                  className="mb-2.5"
                >
                  <div className="block rounded-xl px-2 py-1">
                    <div className="h-5.25 w-full animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
