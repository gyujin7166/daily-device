'use client';

import { useTranslations } from 'next-intl';

import { useRecommendedProducts } from '@entities/product/queries/useRecommendedProducts';

import ProductDetailCarousel from '@widgets/product-recommendation/ui/ProductDetailCarousel';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type MyPageEmptyRecommendedProductsProps = {
  title?: string;
  context?: 'orders-empty' | 'wishlist-empty';
};

const pulseClassName = 'animate-pulse bg-line dark:bg-dark-bg-hover';

export default function MyPageEmptyRecommendedProducts({
  title,
  context = 'orders-empty',
}: MyPageEmptyRecommendedProductsProps) {
  const t = useTranslations('Products.detail.carousel');
  const sectionTitle = title ?? t('forYou');
  const { data: recommendedItems = [], isPending } = useRecommendedProducts({
    limit: 10,
    context,
  });

  if (isPending) {
    return (
      <section className="overflow-hidden rounded-2xl border border-line bg-surface py-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
        <PageWrapper
          as="section"
          padding="wide"
          className="max-w-4xl px-5 pb-0 sm:px-7 lg:px-8"
        >
          <header className="mb-4 flex items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-[0.24em] text-primary dark:text-blue-300">
                FOR YOU
              </p>
              <h2 className="text-xl font-semibold leading-[1.2] tracking-[-0.01em] text-ink sm:text-2xl dark:text-surface">
                {sectionTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`inline-flex h-10 w-10 rounded-full border border-line dark:border-dark-border ${pulseClassName}`}
              />
              <div
                className={`inline-flex h-10 w-10 rounded-full border border-line dark:border-dark-border ${pulseClassName}`}
              />
            </div>
          </header>

          <div className="-m-2 overflow-hidden p-2">
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`my-page-empty-recommendation-skeleton-${index}`}
                  className="flex-[0_0_calc((100%-14px)/2)] sm:flex-[0_0_calc((100%-32px)/3)] lg:flex-[0_0_30%] xl:flex-[0_0_30%]"
                >
                  <article className="flex h-full flex-col rounded-3xl border border-line bg-canvas p-3 shadow-xs dark:border-dark-border dark:bg-dark-bg sm:p-3">
                    <div className="relative">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-line dark:bg-dark-bg-hover">
                        <div className={`h-full w-full ${pulseClassName}`} />
                      </div>
                      <div
                        className={`absolute right-2 top-2 h-8 w-8 rounded-full sm:right-2.5 sm:top-2.5 sm:h-9 sm:w-9 ${pulseClassName}`}
                      />
                    </div>

                    <div className="mt-3 flex flex-1 flex-col px-1 pb-1 sm:mt-2">
                      <div className={`h-3 w-20 rounded-sm ${pulseClassName}`} />
                      <div
                        className={`mt-1 h-5 w-[72%] rounded-sm sm:h-6 ${pulseClassName}`}
                      />
                      <div
                        className={`mt-1.5 h-[1.45em] w-[88%] rounded-sm ${pulseClassName}`}
                      />

                      <div className="mt-3 flex min-h-5 w-full items-center justify-start">
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 3 }).map((__, colorIndex) => (
                            <div
                              key={`my-page-empty-recommendation-color-skeleton-${index}-${colorIndex}`}
                              className={`size-5 rounded-full sm:size-6 ${pulseClassName}`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto flex min-h-11 items-end justify-between gap-3 pt-3">
                        <div className="space-y-1">
                          <div
                            className={`h-3 w-18 rounded-sm ${pulseClassName}`}
                          />
                          <div
                            className={`h-5 w-22 rounded-sm ${pulseClassName}`}
                          />
                        </div>
                        <div
                          className={`size-10 shrink-0 rounded-full ${pulseClassName}`}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="h-2 w-5 animate-pulse rounded-full bg-dark-bg dark:bg-dark-bg-hover" />
            <div className={`h-1.5 w-1.5 rounded-full ${pulseClassName}`} />
            <div className={`h-1.5 w-1.5 rounded-full ${pulseClassName}`} />
          </div>
        </PageWrapper>
      </section>
    );
  }

  if (recommendedItems.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface py-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <ProductDetailCarousel
        items={recommendedItems}
        eyebrow="FOR YOU"
        title={sectionTitle}
        density="compact"
        className="pb-0"
        productBackgroundClassName="border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg"
      />
    </section>
  );
}
