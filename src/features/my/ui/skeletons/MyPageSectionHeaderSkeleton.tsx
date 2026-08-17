import type { ReactNode } from 'react';

import { cn } from '@shared/lib/utils/style';

type MyPageSectionHeaderSkeletonProps = {
  label: string;
  title: string;
  descriptionClassName?: string;
  actionClassName?: string;
  menuButton?: ReactNode;
};

export default function MyPageSectionHeaderSkeleton({
  label,
  title,
  descriptionClassName = 'w-56',
  actionClassName,
  menuButton,
}: MyPageSectionHeaderSkeletonProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex min-w-0 items-start justify-between gap-3 sm:justify-start">
          <div className="border-l-4 border-primary pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {label}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-ink dark:text-surface">
              {title}
            </h1>
          </div>
          {menuButton}
        </div>
        <div
          className={cn(
            'h-4 animate-pulse rounded-sm bg-line dark:bg-dark-border sm:mb-1',
            descriptionClassName,
          )}
        />
      </div>
      {actionClassName ? (
        <div
          className={cn(
            'h-10 animate-pulse rounded-full bg-line dark:bg-dark-border',
            actionClassName,
          )}
        />
      ) : null}
    </header>
  );
}
