import type React from 'react';

import { useTranslations } from 'next-intl';

import ProductDetailCarousel from '@widgets/product-recommendation/ui/ProductDetailCarousel';

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
  const t = useTranslations('Products.detail.carousel');

  return (
    <>
      {recommendedItems.length > 0 ? (
        <section className="pt-2">
          <ProductDetailCarousel
            items={recommendedItems}
            eyebrow="RECOMMENDED"
            title={t('recommended')}
          />
        </section>
      ) : null}

      {recentlyViewedItems.length > 0 ? (
        <section className="pt-10 sm:pt-12">
          <ProductDetailCarousel
            items={recentlyViewedItems}
            eyebrow="RECENTLY VIEWED"
            title={t('recentlyViewed')}
          />
        </section>
      ) : null}
    </>
  );
}
