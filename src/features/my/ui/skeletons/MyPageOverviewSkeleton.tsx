import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import MyPageSectionHeaderSkeleton from './MyPageSectionHeaderSkeleton';

type MyPageOverviewSkeletonProps = {
  menuButton?: ReactNode;
};

export default function MyPageOverviewSkeleton({
  menuButton,
}: MyPageOverviewSkeletonProps) {
  const t = useTranslations('MyOverview.page');

  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeaderSkeleton
        label="SUMMARY"
        title={t('title')}
        descriptionClassName="w-72"
        menuButton={menuButton}
      />

      <div className="grid gap-6">
        <section className="overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-line dark:bg-dark-border" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="mt-3 h-8 w-40 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="mt-2 h-4 w-56 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-7 w-32 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
          <div className="rounded-xl border border-line bg-canvas px-4 py-4 dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="h-4 w-44 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-line dark:bg-dark-border" />
            </div>
            <div className="mt-3 h-4 w-40 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="mt-3 h-6 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="h-7 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-4 w-16 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
          <div className="rounded-xl border border-line bg-canvas px-4 py-4 dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="mt-2 h-4 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="mt-3 h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
          <div className="h-7 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          <div className="mt-3 rounded-xl border border-line bg-canvas px-4 py-4 dark:border-dark-border dark:bg-dark-bg-hover">
            <div className="h-4 w-52 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
        </section>
      </div>
    </div>
  );
}
