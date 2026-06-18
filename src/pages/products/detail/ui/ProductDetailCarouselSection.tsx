import type React from 'react';

import ProductDetailCarousel from './ProductDetailCarousel';

type ProductDetailCarouselItems = React.ComponentProps<
  typeof ProductDetailCarousel
>['items'];

type ProductDetailCarouselSectionProps = {
  recentlyViewedItems: ProductDetailCarouselItems;
  recommendedItems: ProductDetailCarouselItems;
};

export default function ProductDetailCarouselSection({
  recentlyViewedItems,
  recommendedItems,
}: ProductDetailCarouselSectionProps) {
  return (
    <>
      {recommendedItems.length > 0 ? (
        <section className="pt-2">
          <ProductDetailCarousel
            items={recommendedItems}
            eyebrow="RECOMMENDED"
            title="추천 상품"
          />
        </section>
      ) : null}

      {recentlyViewedItems.length > 0 ? (
        <section className="pt-10 sm:pt-12">
          <ProductDetailCarousel
            items={recentlyViewedItems}
            eyebrow="RECENTLY VIEWED"
            title="최근 본 상품"
          />
        </section>
      ) : null}
    </>
  );
}
