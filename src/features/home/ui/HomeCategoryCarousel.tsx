import { useTranslations } from 'next-intl';

import type { HomeSection } from '@entities/home/model/types';

import { cn } from '@shared/lib/utils/style';

import { useHomeCategoryCarousel } from '../model/hooks/useHomeCategoryCarousel';

import HomeCategoryCarouselArrowButton from './HomeCategoryCarouselArrowButton';
import HomeCategoryCarouselSlide from './HomeCategoryCarouselSlide';
import HomeSectionHeader from './HomeSectionHeader';

import type { HomeCategoryCarouselItem } from '../model/homeCategoryCarousel';

type HomeCategoryCarouselProps = {
  section?: HomeSection;
};

const toLabelPosition = (value: string | null): 'top' | 'bottom' | undefined =>
  value === 'top' || value === 'bottom' ? value : undefined;

const toCategoryCarouselItems = (
  section: HomeSection | undefined,
): HomeCategoryCarouselItem[] => {
  if (!section) {
    return [];
  }

  return section.items
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((item) => ({
      label: item.label ?? item.title,
      cta: item.cta ?? undefined,
      imageSrc: item.image_url,
      imageAlt: item.imageAlt ?? item.title,
      href: item.href ?? undefined,
      labelPosition: toLabelPosition(item.labelPosition),
      imageClassName: item.imageClassName ?? undefined,
    }));
};

export default function HomeCategoryCarousel({
  section,
}: HomeCategoryCarouselProps) {
  const t = useTranslations('Home.category');
  const items = toCategoryCarouselItems(section);
  const {
    emblaRef,
    prevBtnDisabled,
    nextBtnDisabled,
    canScroll,
    scrollPrev,
    scrollNext,
  } = useHomeCategoryCarousel();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-canvas py-14 text-ink sm:py-16 lg:py-20 dark:bg-dark-bg dark:text-surface">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <HomeSectionHeader
          eyebrow={section?.eyebrow ?? t('eyebrow')}
          title={section?.title ?? t('title')}
          subtitle={section?.subtitle ?? t('subtitle')}
          action={
            <div
              className={cn('flex shrink-0 gap-2', !canScroll && 'invisible')}
            >
              <HomeCategoryCarouselArrowButton
                direction="prev"
                disabled={prevBtnDisabled}
                onClick={scrollPrev}
              />
              <HomeCategoryCarouselArrowButton
                direction="next"
                disabled={nextBtnDisabled}
                onClick={scrollNext}
              />
            </div>
          }
        />

        <div ref={emblaRef} className="overflow-hidden">
          <div className="-ml-4 flex touch-pan-y sm:-ml-5">
            {items.map((item, index) => (
              <div
                key={`${item.href ?? item.label}-${index}`}
                className="min-w-0 flex-[0_0_80%] pl-4 sm:flex-[0_0_45%] sm:pl-5 md:flex-[0_0_36%] lg:flex-[0_0_25%]"
              >
                <HomeCategoryCarouselSlide item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
