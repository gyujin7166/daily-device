import type { ReactNode } from 'react';

import MyPageSectionHeaderSkeleton from './MyPageSectionHeaderSkeleton';

type MyPageOrdersSkeletonProps = {
  pageClassName: string;
  pageLabel: string;
  pageTitle: string;
  pageDescription: string;
  menuButton?: ReactNode;
  itemCount?: number;
};

export default function MyPageOrdersSkeleton({
  pageClassName,
  pageLabel,
  pageTitle,
  menuButton,
  itemCount = 5,
}: MyPageOrdersSkeletonProps) {
  return (
    <div className={pageClassName}>
      <MyPageSectionHeaderSkeleton
        label={pageLabel}
        title={pageTitle}
        descriptionClassName="w-56"
        menuButton={menuButton}
      />

      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <article
            key={`order-skeleton-${index}`}
            className="overflow-hidden rounded-2xl border-2 border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-panel"
          >
            <div className="border-b border-line dark:border-dark-border">
              <div className="px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="h-8 w-16 shrink-0 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                    <div className="h-4 w-40 max-w-[42vw] animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>
                  <div className="h-4 w-14 shrink-0 animate-pulse rounded-sm bg-line dark:bg-dark-border sm:w-16" />
                </div>
              </div>

              <div className="border-t border-line bg-info-soft px-5 py-3 sm:px-6 dark:border-dark-border dark:bg-dark-bg-hover">
                <div className="grid gap-2 md:grid-cols-[148px_148px_minmax(0,1fr)] md:gap-5">
                  {Array.from({ length: 3 }).map((__, infoIdx) => (
                    <div
                      key={`order-skeleton-info-${index}-${infoIdx}`}
                      className="flex min-w-0 items-center gap-2"
                    >
                      <div className="h-3.5 w-10 shrink-0 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-5 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y divide-line dark:divide-dark-border">
              <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] items-center border-b border-line bg-canvas/80 px-6 py-2.5 dark:border-dark-border dark:bg-dark-bg/70 md:grid">
                <div className="flex w-full justify-start">
                  <div className="h-3 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
                <div className="flex w-full justify-start">
                  <div className="h-3 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
                <div className="flex w-full justify-end">
                  <div className="h-3 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
                <div className="flex w-full justify-end">
                  <div className="h-3 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
                <div className="flex w-full justify-end">
                  <div className="h-3 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
              </div>

              <div className="bg-surface px-5 py-5 sm:px-6 md:py-4 dark:bg-dark-panel">
                <div className="md:hidden">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-5">
                    <div className="h-26 w-26 shrink-0 animate-pulse rounded-2xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border sm:h-30.5 sm:w-30.5" />
                    <div className="flex min-h-26 min-w-0 flex-1 flex-col justify-between sm:min-h-30.5">
                      <div className="space-y-2">
                        <div className="h-6 w-4/5 animate-pulse rounded-sm bg-line dark:bg-dark-border sm:h-7" />
                        <div className="h-4 w-3/5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                        <div className="h-4 w-2/5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      </div>
                      <div className="h-5 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                  </div>
                  <div className="mt-4 border-t border-line pt-4 dark:border-dark-border">
                    <div className="h-11 w-full animate-pulse rounded-full bg-line dark:bg-dark-border" />
                  </div>
                </div>

                <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] items-center gap-3 md:grid">
                  <div className="flex w-full min-w-0 items-center justify-start gap-4">
                    <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-[85%] max-w-60 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-4 w-[55%] max-w-40 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                  </div>

                  <div className="flex w-full min-w-0 items-center justify-start gap-3">
                    <div className="h-3.5 w-3.5 shrink-0 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                    <div className="h-4 w-[70%] max-w-25 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>

                  <div className="flex w-full justify-end">
                    <div className="h-5 w-8 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>

                  <div className="flex w-full justify-end">
                    <div className="h-5 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>
                  <div className="flex w-full justify-end">
                    <div className="h-10 w-24 animate-pulse rounded-lg bg-line dark:bg-dark-border" />
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
