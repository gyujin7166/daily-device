'use client';
import { PRODUCT_GRID_PAGE_SIZE } from '@entities/product/constants/pagination';
import { ProductSkeleton } from '@entities/product/ui';

import Hero from '@shared/ui/Hero/Hero';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import {
  PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME,
  PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX,
} from './productAllHeroConfig';

export default function ProductAllLoadingState() {
  return (
    <div className="bg-canvas text-ink dark:bg-dark-bg dark:text-surface">
      <Hero
        imagesSet={[]}
        minHeight={50}
        minHeightClassName={PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME}
        imageClassName="object-center"
        viewportOffsetTopPx={PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX}
      >
        {null}
      </Hero>

      <section className="w-full border-b border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
        <PageWrapper className="flex items-center justify-between gap-3 py-4">
          <div className="h-4 w-20 animate-pulse rounded-sm bg-line dark:bg-dark-bg-hover" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-line dark:bg-dark-bg-hover" />
        </PageWrapper>
      </section>

      <PageWrapper as="section" className="py-8 sm:py-10">
        <ProductSkeleton
          variant="product"
          columns="four"
          length={PRODUCT_GRID_PAGE_SIZE}
        />
      </PageWrapper>
    </div>
  );
}
