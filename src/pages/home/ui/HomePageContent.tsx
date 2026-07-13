'use client';
import { useMemo } from 'react';

import { useTranslations } from 'next-intl';


import { HomeCategoryCarousel, MainProductItem } from '@features/home/ui';

import { useHomeSections } from '@entities/home/queries/useHomeSections';
import { useHero } from '@entities/product/queries/useHero';

import { useBlurImages } from '@shared/hooks/useBlurImages';
import { Link } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';
import Hero from '@shared/ui/Hero/Hero';

export default function HomePageContent() {
  const t = useTranslations('Home.hero');
  const { data: hero } = useHero({ type: 'main' });
  const { data: homeSections } = useHomeSections();
  const featuredSection = homeSections?.find(
    (section) => section.key === 'featured-products',
  );
  const categoryCarouselSection = homeSections?.find(
    (section) => section.key === 'category-carousel',
  );
  const heroItems = useMemo(
    () =>
      (hero ?? []).flatMap((item) =>
        item.image_url ? [{ ...item, image_url: item.image_url }] : [],
      ),
    [hero],
  );
  const imagesSet = useBlurImages(heroItems);
  const heroContent = imagesSet[0];
  const heroUsesLightText = heroContent?.textTone !== 'dark';

  return (
    <div className="bg-canvas text-ink dark:bg-dark-bg dark:text-surface">
      <Hero
        minHeight={75}
        minHeightClassName="h-[clamp(680px,75svh,980px)]"
        imagesSet={imagesSet}
        viewportOffsetTopPx={90}
        imageClassName="object-[58%_center]"
        position="start"
        verticalPosition="center"
        contentWidth="1/2"
        useImagePosition={false}
        defaultTextTone="light"
      >
        {heroContent ? (
          <div
            className={cn(
              'flex max-w-2xl -translate-y-8 flex-col items-start sm:-translate-y-10 lg:-translate-y-12',
              heroUsesLightText
                ? 'drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]'
                : 'drop-shadow-[0_2px_12px_rgba(255,255,255,0.35)]',
            )}
          >
            <h1 className="mb-5 max-w-155 text-4xl font-extrabold leading-[1.02] tracking-normal break-keep sm:text-5xl lg:mb-6 lg:text-6xl xl:text-7xl">
              {heroContent.description}
            </h1>
            <p
              className={cn(
                'mb-8 max-w-md text-sm font-light leading-relaxed break-keep sm:text-base lg:text-lg',
                heroUsesLightText ? 'text-surface/90' : 'text-ink/80',
              )}
            >
              {heroContent.detailed_description}
            </p>
            <Link
              href="/products"
              className={cn(
                'inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border-2 px-7 py-3.5 text-sm font-bold leading-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-150 sm:px-8 sm:py-4',
                heroUsesLightText
                  ? 'border-surface bg-surface text-ink hover:bg-surface/90 hover:text-ink'
                  : 'border-ink bg-ink text-surface hover:bg-ink/90 hover:text-surface',
              )}
            >
              <span>{t('viewAllProducts')}</span>
            </Link>
          </div>
        ) : null}
      </Hero>

      <MainProductItem section={featuredSection} />
      <HomeCategoryCarousel section={categoryCarouselSection} />
    </div>
  );
}
