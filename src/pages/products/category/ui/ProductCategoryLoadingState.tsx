import ProductFilterSkeleton from '@features/product-filter/ui/ProductFilterSkeleton';

import ProductSkeleton from '@entities/product/ui/ProductSkeleton';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ProductCategoryLoadingStateProps = {
  hasActiveFilterBar?: boolean;
  colorRows?: number;
};

export default function ProductCategoryLoadingState({
  hasActiveFilterBar = false,
  colorRows,
}: ProductCategoryLoadingStateProps) {
  return (
    <div className="bg-canvas dark:bg-dark-bg">
      <section className="relative min-h-[28vh] animate-pulse bg-line supports-[height:100svh]:min-h-[28svh] sm:min-h-[32vh] sm:supports-[height:100svh]:min-h-[32svh] md:min-h-[42vh] md:supports-[height:100svh]:min-h-[42svh] lg:min-h-[50vh] dark:bg-dark-bg-hover">
        <div className="absolute inset-0 bg-line dark:bg-dark-bg-hover" />
      </section>

      <section className="w-full border-b border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
        <PageWrapper className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-28 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
            <div className="h-3 w-16 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        </PageWrapper>
      </section>

      <section className="overflow-hidden bg-canvas py-8 text-ink sm:py-10 dark:bg-dark-bg dark:text-surface">
        <PageWrapper>
          <div className="flex flex-col gap-8 lg:flex-row">
            <aside className="hidden w-full shrink-0 lg:block lg:w-65">
              <ProductFilterSkeleton colorRows={colorRows} />
            </aside>

            <div className="min-w-0 flex-1">
              {hasActiveFilterBar ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  <div className="h-9 w-36 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
                  <div className="h-9 w-20 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
                </div>
              ) : null}
              <ProductSkeleton variant="product" length={6} />
            </div>
          </div>
        </PageWrapper>
      </section>
    </div>
  );
}
