import type { ReactNode } from 'react';

import { cn } from '@shared/lib/utils/style';

import MyPageMobileMenuButton from './MyPageMobileMenuButton';

type MyPageSectionHeaderProps = {
  label: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function MyPageSectionHeader({
  label,
  title,
  description,
  action,
  className,
}: MyPageSectionHeaderProps) {
  return (
    <header
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
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
          <MyPageMobileMenuButton />
        </div>
        {description ? (
          <p className="text-sm text-muted dark:text-dark-muted sm:pb-1">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
