import type React from 'react';

import Hero from '@shared/ui/Hero/Hero';

type ProductCategoryHeroSectionProps = {
  imagesSet: React.ComponentProps<typeof Hero>['imagesSet'];
};

export default function ProductCategoryHeroSection({
  imagesSet,
}: ProductCategoryHeroSectionProps) {
  const heroImages = imagesSet ?? [];
  const heroContent = heroImages[0];
  const eyebrow =
    typeof heroContent?.name_en === 'string'
      ? heroContent.name_en.replaceAll('-', ' ')
      : null;

  return (
    <Hero
      imagesSet={heroImages}
      minHeight={50}
      minHeightClassName="min-h-[44vh] supports-[height:100svh]:min-h-[44svh] sm:min-h-[46vh] sm:supports-[height:100svh]:min-h-[46svh] md:min-h-[48vh] md:supports-[height:100svh]:min-h-[48svh] lg:min-h-[50vh]"
      imageClassName="object-center"
      viewportOffsetTopPx={90}
      contentWidth="1/2"
    >
      <div className="flex flex-col">
        {eyebrow ? (
          <p className="hidden text-md font-bold uppercase tracking-[0.35em] text-primary sm:block">
            {eyebrow}
          </p>
        ) : null}
        {heroContent?.name_en ? (
          <h1 className="mb-1 break-keep text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {heroContent.name_en}
          </h1>
        ) : null}
        <div className="mb-7.5">
          <span className="text-base leading-snug sm:text-base">
            {heroContent?.description}
          </span>
        </div>
      </div>
    </Hero>
  );
}
