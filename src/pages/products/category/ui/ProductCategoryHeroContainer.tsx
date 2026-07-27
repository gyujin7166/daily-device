'use client';
import { useMemo } from 'react';

import { useHero } from '@entities/product/queries/useHero';

import { useBlurImages } from '@shared/hooks/useBlurImages';

import ProductCategoryHeroSection from './ProductCategoryHeroSection';

type ProductCategoryHeroContainerProps = {
  category: string;
};

export default function ProductCategoryHeroContainer({
  category,
}: ProductCategoryHeroContainerProps) {
  const { data: hero } = useHero({
    type: 'product',
    category,
  });
  const heroItems = useMemo(
    () =>
      (hero ?? []).flatMap((item) =>
        item.image_url ? [{ ...item, image_url: item.image_url }] : [],
      ),
    [hero],
  );
  const imagesSet = useBlurImages(heroItems);

  return <ProductCategoryHeroSection imagesSet={imagesSet} />;
}
