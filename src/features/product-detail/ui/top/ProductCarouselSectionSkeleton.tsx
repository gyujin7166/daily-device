import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ProductCarouselSectionSkeletonProps = {
  eyebrow?: string;
  title?: string;
};

export default function ProductCarouselSectionSkeleton({
  eyebrow = 'RECOMMENDED',
  title = '추천 상품',
}: ProductCarouselSectionSkeletonProps) {
  return (
    <PageWrapper as="section" padding="wide" className="pb-16">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary dark:text-blue-300">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-semibold leading-[1.2] tracking-[-0.01em] text-ink dark:text-surface">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 animate-pulse items-center justify-center rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
          <div className="inline-flex h-10 w-10 animate-pulse items-center justify-center rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
        </div>
      </header>

      <div className="-m-3 overflow-hidden p-3">
        <div className="flex gap-3.5 sm:gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`product-carousel-skeleton-card-${index}`}
              className="flex-[0_0_calc((100%-14px)/2)] sm:flex-[0_0_calc((100%-32px)/3)] lg:flex-[0_0_calc((100%-48px)/4)] xl:flex-[0_0_calc((100%-64px)/5)]"
            >
              <article className="flex h-full flex-col rounded-3xl bg-surface p-3 shadow-xs sm:p-3 dark:bg-dark-panel">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-line dark:bg-dark-bg-hover">
                  <div className="h-full w-full animate-pulse bg-line/80 dark:bg-dark-border" />
                </div>

                <div className="mt-3 flex flex-1 flex-col px-1 pb-1 sm:mt-2">
                  <div className="h-3 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  <div className="mt-2 h-5 w-4/5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  <div className="mt-1.5 h-3.5 min-h-[1.45em] w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />

                  <div className="mt-3 flex min-h-5 w-full items-center justify-start">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 3 }).map((__, colorIdx) => (
                        <div
                          key={`product-carousel-skeleton-color-${index}-${colorIdx}`}
                          className="size-5 animate-pulse rounded-full bg-line dark:bg-dark-border"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-3">
                    <div className="space-y-1">
                      <div className="h-3 w-18 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-5 w-22 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                    <div className="size-10 shrink-0 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <div className="h-2 w-5 animate-pulse rounded-full bg-dark-bg dark:bg-dark-bg-hover" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
      </div>
    </PageWrapper>
  );
}
