import type { ReactNode } from 'react';

type MyPageOrderDetailSkeletonProps = {
  pageClassName?: string;
  menuButton?: ReactNode;
};

export default function MyPageOrderDetailSkeleton({
  pageClassName = 'w-full lg:pl-4',
  menuButton,
}: MyPageOrderDetailSkeletonProps) {
  return (
    <section className={pageClassName}>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-start justify-between gap-3 md:block">
          <div className="border-l-4 border-primary pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              ORDER
            </p>
            <h1 className="mt-2 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] text-ink dark:text-surface">
              주문 상세
            </h1>
          </div>
          {menuButton}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden h-11 w-28 animate-pulse rounded-full bg-line dark:bg-dark-border sm:block" />
        </div>
      </header>

      <div className="mb-5 h-4 w-52 animate-pulse rounded-sm bg-line dark:bg-dark-border" />

      <article className="overflow-hidden rounded-3xl border-4 border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-bg">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/40 px-7 py-5 dark:border-dark-border dark:bg-dark-bg-hover">
          <div className="h-4 w-52 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-line dark:bg-dark-border" />
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <section className="rounded-2xl border border-line bg-info-soft px-4 py-4 dark:border-dark-border dark:bg-dark-panel">
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-52 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="h-4 w-44 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              <div className="h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            </div>
          </section>

          <section>
            <div className="mb-4 h-5 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="space-y-5">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`order-detail-skeleton-${index}`}
                  className={
                    index !== 1
                      ? 'border-b border-line pb-5 dark:border-dark-border'
                      : ''
                  }
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-26 w-26 shrink-0 animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />

                    <div className="min-w-0 flex-1">
                      <div className="h-5 w-2/3 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="mt-2 space-y-1.5">
                        <div className="h-4 w-1/3 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                        <div className="h-4 w-1/2 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      </div>
                      <div className="mt-3 h-4 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-line px-5 py-4 sm:px-6 dark:border-dark-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-4 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
            <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
          </div>
          <div className="mt-3 h-4 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
        </footer>
      </article>
    </section>
  );
}
