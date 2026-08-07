import { memo, Suspense, useState } from 'react';
import type React from 'react';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import ProductDetail from '../detail/ProductDetail';
import ProductDetailSkeleton from '../detail/ProductDetailSkeleton';

import BreadCrumbSkeleton from './BreadCrumbSkeleton';
import ProductCarouselSkeleton from './ProductCarouselSkeleton';
import ProductDetailBreadCrumb from './ProductDetailBreadcrumb';
import ProductImageCarousel from './ProductImageCarousel';

type ProductDetailTopSectionProps = {
  detail: string;
  isDetailInitialLoading: boolean;
  carouselColumnRef: React.RefObject<HTMLDivElement | null>;
  carouselBaseHeight: number;
};

function ProductDetailTopSection({
  detail,
  isDetailInitialLoading,
  carouselColumnRef,
  carouselBaseHeight,
}: ProductDetailTopSectionProps) {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  return (
    <PageWrapper>
      <section className="py-4 sm:py-6 lg:py-8">
        {isDetailInitialLoading ? (
          <BreadCrumbSkeleton />
        ) : (
          <ProductDetailBreadCrumb detail={detail} />
        )}
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <div
            ref={carouselColumnRef}
            className="min-w-0 w-full lg:sticky lg:top-27 lg:self-start"
          >
            {isDetailInitialLoading ? (
              <ProductCarouselSkeleton />
            ) : (
              <ProductImageCarousel
                detail={detail}
                selectedColorId={selectedColorId}
              />
            )}
          </div>
          <div
            className="min-w-0"
            style={
              carouselBaseHeight > 0
                ? { minHeight: `${carouselBaseHeight}px` }
                : undefined
            }
          >
            <Suspense fallback={<ProductDetailSkeleton />}>
              <ProductDetail
                detail={detail}
                onSelectedColorChange={setSelectedColorId}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default memo(ProductDetailTopSection);
