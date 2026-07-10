import type React from 'react';

import Hero from '@shared/ui/Hero/Hero';

import {
  PRODUCT_ALL_HERO_CONTENT,
  PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME,
  PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX,
} from './productAllHeroConfig';

import type { ProductAllHeroContent } from './productAllHeroConfig';

type ProductAllHeroSectionProps = {
  imagesSet: React.ComponentProps<typeof Hero>['imagesSet'];
  content?: ProductAllHeroContent;
};

export default function ProductAllHeroSection({
  content = PRODUCT_ALL_HERO_CONTENT,
  imagesSet,
}: ProductAllHeroSectionProps) {
  const heroImages = imagesSet ?? [];
  const heroContent = heroImages[0];
  const resolvedContent = {
    eyebrow: content.eyebrow,
    title: heroContent?.name_en || content.title,
    description: heroContent?.description || content.description,
  };

  return (
    <Hero
      imagesSet={heroImages}
      minHeight={50}
      minHeightClassName={PRODUCT_ALL_HERO_MIN_HEIGHT_CLASS_NAME}
      imageClassName="object-center"
      viewportOffsetTopPx={PRODUCT_ALL_HERO_VIEWPORT_OFFSET_TOP_PX}
      position="center"
    >
      <div className="flex flex-col">
        <p className="hidden text-md font-bold uppercase tracking-[0.35em] text-primary sm:block">
          {resolvedContent.eyebrow}
        </p>
        <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-4xl lg:mb-6.75 lg:text-5xl">
          {resolvedContent.title}
        </h1>
        <div className="mb-7.5 max-w-xl">
          <span className="text-base leading-snug sm:text-base">
            {resolvedContent.description}
          </span>
        </div>
      </div>
    </Hero>
  );
}
