'use client';

import { PRODUCT_GRID_PAGE_SIZE } from '@entities/product/constants/pagination';
import { ProductSkeleton } from '@entities/product/ui';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

export default function ProductAllLoadingState() {
  return (
    <>
      <section className="w-full border-b border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
        <PageWrapper className="flex items-center justify-between gap-3 py-4">
          <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        </PageWrapper>
      </section>

      <PageWrapper as="section" className="py-8 sm:py-10">
        <ProductSkeleton columns="four" length={PRODUCT_GRID_PAGE_SIZE} />
      </PageWrapper>
    </>
  );
}
