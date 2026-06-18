import { useState } from 'react';
import type React from 'react';

import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import ProductDetail from '../detail/ProductDetail';

import BreadCrumbSkeleton from './BreadCrumbSkeleton';
import ProductCarouselSkeleton from './ProductCarouselSkeleton';
import ProductDetailBreadCrumb from './ProductDetailBreadcrumb';
import ProductImageCarousel from './ProductImageCarousel';

type ProductDetailTopSectionProps = {
  detail: string;
  isPending: boolean;
  carouselColumnRef: React.RefObject<HTMLDivElement | null>;
  carouselBaseHeight: number;
};

export default function ProductDetailTopSection({
  detail,
  isPending,
  carouselColumnRef,
  carouselBaseHeight,
}: ProductDetailTopSectionProps) {
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  return (
    <PageWrapper>
      <section className="py-4 sm:py-6 lg:py-8">
        {isPending ? (
          <BreadCrumbSkeleton />
        ) : (
          <ProductDetailBreadCrumb detail={detail} />
        )}
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <div
            ref={carouselColumnRef}
            className="min-w-0 w-full lg:sticky lg:top-27 lg:self-start"
          >
            {isPending ? (
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
            <ProductDetail
              detail={detail}
              onSelectedColorChange={setSelectedColorId}
            />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
