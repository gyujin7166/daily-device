'use client';

import type { ReactNode } from 'react';

import {
  IconBox,
  IconHeart,
  IconHomePlus,
  IconPencilPlus,
  IconStar,
} from '@tabler/icons-react';

import { cn } from '@shared/lib/utils/style';

import type { Icon } from '@tabler/icons-react';

type MyPageEmptyIconVariant =
  | 'orders'
  | 'wishlist'
  | 'address'
  | 'write-review'
  | 'reviews';

type EmptyIconConfig = {
  MainIcon: Icon;
  badgeClassName: string;
  iconClassName: string;
};

const EMPTY_ICON_CONFIG: Record<MyPageEmptyIconVariant, EmptyIconConfig> = {
  orders: {
    MainIcon: IconBox,
    badgeClassName:
      'border-primary/15 bg-primary-soft text-primary dark:border-primary/25 dark:bg-primary/15',
    iconClassName: 'text-primary dark:text-primary',
  },
  wishlist: {
    MainIcon: IconHeart,
    badgeClassName:
      'border-danger/15 bg-danger/10 text-danger dark:border-danger/25 dark:bg-danger/15',
    iconClassName: 'text-danger dark:text-danger',
  },
  address: {
    MainIcon: IconHomePlus,
    badgeClassName:
      'border-success/15 bg-success-soft text-success dark:border-success/25 dark:bg-success/15',
    iconClassName: 'text-success dark:text-success',
  },
  'write-review': {
    MainIcon: IconPencilPlus,
    badgeClassName:
      'border-warning/20 bg-warning-soft text-warning dark:border-warning/30 dark:bg-warning/15',
    iconClassName: 'text-warning dark:text-warning',
  },
  reviews: {
    MainIcon: IconStar,
    badgeClassName:
      'border-accent-violet/15 bg-accent-violet/10 text-accent-violet dark:border-accent-violet/25 dark:bg-accent-violet/15',
    iconClassName: 'text-accent-violet dark:text-accent-violet',
  },
};

type MyPageEmptyStatePanelProps = {
  title: string;
  description: string;
  iconVariant: MyPageEmptyIconVariant;
  layout?: 'vertical' | 'horizontal';
  action?: ReactNode;
  children?: ReactNode;
};

export default function MyPageEmptyStatePanel({
  title,
  description,
  iconVariant,
  layout = 'vertical',
  action,
  children,
}: MyPageEmptyStatePanelProps) {
  const hasSupplement = Boolean(children);
  const isHorizontal = layout === 'horizontal';
  const {
    MainIcon,
    badgeClassName,
    iconClassName,
  } = EMPTY_ICON_CONFIG[iconVariant];

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div
        className={cn(
          isHorizontal
            ? 'flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:justify-between sm:gap-5 sm:px-7 sm:text-left lg:px-8'
            : 'flex flex-col items-center justify-center gap-5 px-5 py-8 text-center sm:px-8 sm:py-9 lg:px-10',
          isHorizontal
            ? 'min-h-30 sm:min-h-32'
            : hasSupplement
              ? 'min-h-56 sm:min-h-60'
              : 'min-h-58 sm:min-h-64',
        )}
      >
        <div
          className={cn(
            'flex items-center',
            isHorizontal
              ? 'w-full min-w-0 flex-col justify-center gap-3 sm:flex-1 sm:flex-row sm:justify-start sm:gap-4'
              : 'flex-col justify-center',
          )}
        >
          <div
            className={cn(
              'group flex shrink-0 items-center justify-center rounded-full border shadow-[0_18px_34px_-26px_rgba(15,23,42,0.65)] transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5',
              isHorizontal ? 'size-15 sm:size-17' : 'size-20 sm:size-22',
              badgeClassName,
            )}
          >
            <MainIcon
              size={isHorizontal ? 28 : 38}
              stroke={1.7}
              className={cn(
                'transition-transform duration-200 ease-out motion-safe:group-hover:scale-105',
                iconClassName,
              )}
            />
          </div>

          <div
            className={cn(
              'min-w-0',
              isHorizontal
                ? 'flex-1'
                : 'mx-auto mt-5 w-full max-w-86 text-center',
            )}
          >
            <h3 className="text-lg font-extrabold leading-tight text-ink dark:text-surface sm:text-xl">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted dark:text-dark-muted">
              {description}
            </p>
            {!isHorizontal && action ? (
              <div className="mt-4">{action}</div>
            ) : null}
          </div>
        </div>

        {isHorizontal && action ? (
          <div className="flex shrink-0 justify-center sm:justify-end">
            {action}
          </div>
        ) : null}
      </div>

      {children}
    </section>
  );
}
