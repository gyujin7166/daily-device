'use client';
import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import type { HeroTypeValue } from '@entities/product/model/types';
import { useHero } from '@entities/product/queries/useHero';

import { useBlurImages } from '@shared/hooks/useBlurImages';

import ProductAllHeroSection from './ProductAllHeroSection';

type ProductAllHeroContainerProps = {
  discountedOnly?: boolean;
};

export default function ProductAllHeroContainer({
  discountedOnly = false,
}: ProductAllHeroContainerProps) {
  const t = useTranslations('Products.allHero');
  const heroType: HeroTypeValue = discountedOnly
    ? 'product-discounts'
    : 'product-all';
  const { data: hero } = useHero({ type: heroType });
  const heroItems = useMemo(
    () =>
      (hero ?? []).flatMap((item) =>
        item.image_url ? [{ ...item, image_url: item.image_url }] : [],
      ),
    [hero],
  );
  const imagesSet = useBlurImages(heroItems);

  return (
    <ProductAllHeroSection
      content={
        discountedOnly
          ? {
              eyebrow: t('discounts.eyebrow'),
              title: t('discounts.title'),
              description: t('discounts.description'),
            }
          : {
              eyebrow: t('all.eyebrow'),
              title: t('all.title'),
              description: t('all.description'),
            }
      }
      imagesSet={imagesSet}
    />
  );
}
