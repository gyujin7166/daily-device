import type { ReactNode } from 'react';

import MyPageSectionHeaderSkeleton from './MyPageSectionHeaderSkeleton';

type MyAddressSkeletonProps = {
  menuButton?: ReactNode;
  itemCount?: number;
};

export default function MyAddressSkeleton({
  menuButton,
  itemCount = 2,
}: MyAddressSkeletonProps) {
  return (
    <div className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeaderSkeleton
        label="ADDRESSES"
        title="배송지 관리"
        descriptionClassName="w-32"
        actionClassName="w-28"
        menuButton={menuButton}
      />

      <div className="space-y-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <article
            key={`address-skeleton-${index}`}
            className="rounded-3xl border border-line bg-surface px-5 py-6 shadow-xs dark:border-dark-border dark:bg-dark-panel sm:px-7"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 animate-pulse rounded-2xl bg-line dark:bg-dark-border" />
                <div className="space-y-3">
                  <div className="h-8 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  <div className="h-4 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                </div>
              </div>
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-line dark:bg-dark-border" />
            </div>

            <div className="mt-5 border-t border-line pt-5 dark:border-dark-border">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex gap-3">
                  <div className="mt-1 h-5 w-5 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    <div className="h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    <div className="h-4 w-4/5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1 h-5 w-5 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                  <div className="space-y-3">
                    <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    <div className="h-5 w-32 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 h-5 w-32 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </article>
        ))}
      </div>
    </div>
  );
}
