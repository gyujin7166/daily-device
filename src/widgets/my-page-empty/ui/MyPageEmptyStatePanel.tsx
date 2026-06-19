'use client';

import type { ReactNode } from 'react';

import {
  IconHeart,
  IconMapPin,
  IconPencil,
  IconShoppingBag,
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
  glowClassName: string;
  haloClassName: string;
  offsetClassName: string;
  boxClassName: string;
  iconClassName: string;
};

const EMPTY_ICON_CONFIG: Record<MyPageEmptyIconVariant, EmptyIconConfig> = {
  orders: {
    MainIcon: IconShoppingBag,
    glowClassName: 'bg-primary/10 dark:bg-primary/16',
    haloClassName:
      'border-primary/15 bg-primary-soft/70 dark:border-primary/20 dark:bg-primary/10',
    offsetClassName: 'bg-primary/8 dark:bg-primary/12',
    boxClassName:
      'border-primary/10 bg-primary-soft text-primary dark:border-primary/20 dark:bg-dark-bg-hover',
    iconClassName: 'text-primary dark:text-primary',
  },
  wishlist: {
    MainIcon: IconHeart,
    glowClassName: 'bg-primary/8 dark:bg-primary/12',
    haloClassName:
      'border-primary/10 bg-info-soft dark:border-primary/15 dark:bg-primary/8',
    offsetClassName: 'bg-primary/7 dark:bg-primary/10',
    boxClassName:
      'border-primary/10 bg-info-soft text-primary dark:border-primary/15 dark:bg-dark-bg-hover',
    iconClassName: 'text-primary dark:text-primary',
  },
  address: {
    MainIcon: IconMapPin,
    glowClassName: 'bg-success/8 dark:bg-success/10',
    haloClassName:
      'border-success/10 bg-success-soft/70 dark:border-success/15 dark:bg-success/8',
    offsetClassName: 'bg-success/7 dark:bg-success/10',
    boxClassName:
      'border-success/10 bg-success-soft text-success dark:border-success/15 dark:bg-dark-bg-hover',
    iconClassName: 'text-success dark:text-success',
  },
  'write-review': {
    MainIcon: IconPencil,
    glowClassName: 'bg-warning/8 dark:bg-warning/10',
    haloClassName:
      'border-warning/12 bg-warning-soft/70 dark:border-warning/15 dark:bg-warning/8',
    offsetClassName: 'bg-warning/8 dark:bg-warning/10',
    boxClassName:
      'border-warning/12 bg-warning-soft text-warning dark:border-warning/15 dark:bg-dark-bg-hover',
    iconClassName: 'text-warning dark:text-warning',
  },
  reviews: {
    MainIcon: IconStar,
    glowClassName: 'bg-accent-violet/7 dark:bg-accent-violet/10',
    haloClassName:
      'border-accent-violet/10 bg-primary-soft/60 dark:border-accent-violet/15 dark:bg-accent-violet/8',
    offsetClassName: 'bg-accent-violet/7 dark:bg-accent-violet/10',
    boxClassName:
      'border-accent-violet/10 bg-primary-soft/80 text-accent-violet dark:border-accent-violet/15 dark:bg-dark-bg-hover',
    iconClassName: 'text-accent-violet dark:text-accent-violet',
  },
};

type MyPageEmptyStatePanelProps = {
  title: string;
  description: string;
  iconVariant: MyPageEmptyIconVariant;
  action?: ReactNode;
  children?: ReactNode;
};

export default function MyPageEmptyStatePanel({
  title,
  description,
  iconVariant,
  action,
  children,
}: MyPageEmptyStatePanelProps) {
  const hasSupplement = Boolean(children);
  const {
    MainIcon,
    glowClassName,
    haloClassName,
    offsetClassName,
    boxClassName,
    iconClassName,
  } = EMPTY_ICON_CONFIG[iconVariant];

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div
        className={cn(
          'grid items-center justify-center gap-6 px-5 py-8 sm:px-8 sm:py-10 md:grid-cols-[auto_minmax(0,21.5rem)] md:gap-9 lg:gap-10 lg:px-12 lg:py-12',
          hasSupplement
            ? 'min-h-64 sm:min-h-68'
            : 'min-h-72 sm:min-h-80 lg:min-h-86',
        )}
      >
        <div className="flex justify-center">
          <div className="group relative flex size-34 items-center justify-center sm:size-42">
            <div
              className={cn(
                'absolute inset-5 rounded-[2rem] blur-2xl',
                glowClassName,
              )}
            />
            <div
              className={cn(
                'absolute size-28 rounded-[1.75rem] border motion-safe:animate-pulse sm:size-34',
                haloClassName,
              )}
            />
            <div
              className={cn(
                'absolute size-20 rotate-6 rounded-[1.25rem] transition-transform duration-300 ease-out motion-safe:group-hover:rotate-12 sm:size-25',
                offsetClassName,
              )}
            />
            <div
              className={cn(
                'relative flex size-24 items-center justify-center rounded-[1.5rem] border shadow-[0_18px_38px_-28px_rgba(15,23,42,0.55)] transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-1 sm:size-30',
                boxClassName,
              )}
            >
              <MainIcon
                size={54}
                stroke={1.45}
                className={cn(
                  'transition-transform duration-300 ease-out motion-safe:group-hover:scale-105 sm:size-16',
                  iconClassName,
                )}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-86 text-center md:mx-0 md:text-left">
          <h3 className="text-lg font-extrabold leading-tight tracking-[-0.02em] text-ink dark:text-surface sm:text-xl">
            {title}
          </h3>
          <p className="mt-2.5 text-sm leading-6 text-muted dark:text-dark-muted">
            {description}
          </p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </div>

      {children}
    </section>
  );
}
