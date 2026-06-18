import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import ProductDetailSkeleton from './detail/ProductDetailSkeleton';
import BreadCrumbSkeleton from './top/BreadCrumbSkeleton';
import ProductCarouselSectionSkeleton from './top/ProductCarouselSectionSkeleton';
import ProductCarouselSkeleton from './top/ProductCarouselSkeleton';

export default function ProductDetailLoadingState() {
  return (
    <div className="bg-canvas dark:bg-dark-bg">
      <div className="pt-18 sm:pt-22.5">
        <PageWrapper>
          <section className="py-4 sm:py-6 lg:py-8">
            <BreadCrumbSkeleton />
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
              <div className="min-w-0 w-full lg:sticky lg:top-27 lg:self-start">
                <ProductCarouselSkeleton />
              </div>
              <div className="min-w-0">
                <ProductDetailSkeleton />
              </div>
            </div>
          </section>
        </PageWrapper>

        <PageWrapper>
          <div className="mb-10">
            <div className="pt-10 sm:pt-12">
              <div className="flex items-end justify-between border-b border-line pb-5 dark:border-dark-border">
                <div className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl dark:text-surface">
                  상품평
                </div>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-[400px_minmax(0,1fr)] lg:gap-6">
                <div className="flex min-h-48 flex-col items-center justify-center rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8 dark:border-dark-border dark:bg-dark-panel">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-end justify-center gap-2">
                      <div className="h-16 w-28 animate-pulse rounded-sm bg-line sm:h-20 sm:w-36 dark:bg-dark-border" />
                      <div className="mb-2 h-5 w-10 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                    <div className="mt-3 h-5 w-35 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    <div className="mt-3 h-4 w-42.5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                  </div>
                </div>

                <div className="flex min-h-48 flex-col justify-center rounded-3xl border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8 lg:px-10 dark:border-dark-border dark:bg-dark-panel">
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div
                        key={`rating-row-skeleton-${star}`}
                        className="flex items-center gap-4"
                      >
                        <span className="w-11 text-sm font-medium text-ink sm:text-base dark:text-surface">
                          <span aria-hidden="true">{star}</span>
                          <span className="sr-only">{star}점</span>
                        </span>
                        <div className="h-2.5 min-w-0 flex-1 animate-pulse rounded-full bg-line dark:bg-dark-border" />
                        <span className="w-11 text-right text-sm font-medium text-muted sm:text-base dark:text-dark-muted">
                          -
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-12 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel">
              <div className="flex items-center justify-between gap-3">
                <div className="h-7 w-24 animate-pulse rounded-sm bg-line dark:bg-dark-border sm:h-8 sm:w-28" />
                <div className="h-4 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`review-gallery-skeleton-${index}`}
                    className="aspect-square w-23 animate-pulse rounded-xl border border-line bg-line/70 sm:w-26 dark:border-dark-border dark:bg-dark-border"
                  />
                ))}
              </div>
            </section>

            <section className="mt-10 rounded-2xl border border-line bg-surface px-4 py-4 sm:px-5 dark:border-dark-border dark:bg-dark-panel">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="h-10 w-22 animate-pulse rounded-xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
                  <div className="h-10 w-42 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
                </div>
                <div className="h-4 w-37.5 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
              </div>
            </section>

            <div className="mt-8 min-h-60 md:min-h-80">
              <div className="columns-1 gap-6 md:columns-2 [column-fill:balance]">
                {Array.from({ length: 4 }).map((_, index) => (
                  <article
                    key={`review-card-skeleton-${index}`}
                    className="mb-6 break-inside-avoid rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6 dark:border-dark-border dark:bg-dark-panel"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-28 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                    <div className="mt-3 flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((__, starIdx) => (
                        <div
                          key={`review-star-skeleton-${index}-${starIdx}`}
                          className="h-3.5 w-3.5 animate-pulse rounded-xs bg-line dark:bg-dark-border"
                        />
                      ))}
                    </div>
                    <div className="mt-5 space-y-3">
                      <div className="h-5 w-3/4 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-4 w-full animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                      <div className="h-4 w-5/6 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                    </div>
                    <div className="mt-6 flex gap-3 overflow-hidden sm:gap-4">
                      {Array.from({ length: 2 }).map((__, imageIdx) => (
                        <div
                          key={`review-image-skeleton-${index}-${imageIdx}`}
                          className="aspect-square w-25 shrink-0 animate-pulse rounded-2xl border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border sm:w-28"
                        />
                      ))}
                    </div>
                    <div className="mt-6 rounded-xl bg-canvas px-3 py-3 dark:bg-dark-bg-hover">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-36 animate-pulse rounded-sm bg-line dark:bg-dark-border" />
                        <div className="h-10 w-17 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mx-auto mt-4 mb-8 flex max-w-7xl justify-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`review-pagination-skeleton-${index}`}
                  className="h-10 w-10 animate-pulse rounded-full border border-line bg-line/70 dark:border-dark-border dark:bg-dark-border"
                />
              ))}
            </div>
          </div>
        </PageWrapper>

        <section className="pt-2">
          <ProductCarouselSectionSkeleton
            eyebrow="RECOMMENDED"
            title="추천 상품"
          />
        </section>
      </div>
    </div>
  );
}
