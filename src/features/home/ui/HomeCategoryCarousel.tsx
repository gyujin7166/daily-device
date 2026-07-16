import { useTranslations } from 'next-intl';

import type { HomeSection } from '@entities/home/model/types';

import {
  CATEGORY_CAROUSEL_LAYOUTS,
  HOME_CATEGORY_CAROUSEL_SLIDES,
} from '../model/homeCategoryCarousel';
import { useHomeCategoryCarousel } from '../model/hooks/useHomeCategoryCarousel';

import HomeCategoryCarouselArrowButton from './HomeCategoryCarouselArrowButton';
import HomeCategoryCarouselPagination from './HomeCategoryCarouselPagination';
import HomeCategoryCarouselSlide from './HomeCategoryCarouselSlide';
import HomeSectionHeader from './HomeSectionHeader';

import type { HomeCategoryCarouselSlide as HomeCategoryCarouselSlideType } from '../model/homeCategoryCarousel';

type HomeCategoryCarouselProps = {
  section?: HomeSection;
};

const toLabelPosition = (value: string | null): 'top' | 'bottom' | undefined =>
  value === 'top' || value === 'bottom' ? value : undefined;

const CATEGORY_LAYOUT_ITEM_COUNT = 4;

const toCategoryLayoutGroups = (
  section: HomeSection | undefined,
): HomeCategoryCarouselSlideType[] => {
  if (!section) {
    return HOME_CATEGORY_CAROUSEL_SLIDES;
  }

  return section.items
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .reduce<HomeCategoryCarouselSlideType[]>((slides, item, index) => {
      const slideIndex = Math.floor(index / CATEGORY_LAYOUT_ITEM_COUNT);
      const itemIndex = index % CATEGORY_LAYOUT_ITEM_COUNT;
      const layout =
        CATEGORY_CAROUSEL_LAYOUTS[
          slideIndex % CATEGORY_CAROUSEL_LAYOUTS.length
        ];
      const slide = slides[slideIndex] ?? {
        gridAreaClassName: layout.gridAreaClassName,
        items: [],
      };

      slide.items.push({
        label: item.label ?? item.title,
        cta: item.cta ?? undefined,
        imageSrc: item.image_url,
        imageAlt: item.imageAlt ?? item.title,
        href: item.href ?? undefined,
        areaClassName: layout.areaClassNames[itemIndex],
        labelPosition: toLabelPosition(item.labelPosition),
        imageClassName: item.imageClassName ?? undefined,
      });

      slides[slideIndex] = slide;

      return slides;
    }, []);
};

export default function HomeCategoryCarousel({
  section,
}: HomeCategoryCarouselProps) {
  const t = useTranslations('Home.category');
  const slides = toCategoryLayoutGroups(section);
  const {
    emblaRef,
    selectedIndex,
    scrollSnaps,
    prevBtnDisabled,
    nextBtnDisabled,
    showPrevButton,
    showNextButton,
    scrollPrev,
    scrollNext,
    scrollTo,
  } = useHomeCategoryCarousel();

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="overflow-x-hidden bg-canvas py-14 text-ink sm:py-16 lg:py-20 dark:bg-dark-bg dark:text-surface">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        <HomeSectionHeader
          eyebrow={section?.eyebrow ?? t('eyebrow')}
          title={section?.title ?? t('title')}
          subtitle={section?.subtitle ?? t('subtitle')}
          subtitleClassName="max-w-2xl sm:whitespace-nowrap"
        />

        <div className="relative grid">
          <div className="relative w-full">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {slides.map((slide, index) => (
                  <div
                    key={`${slide.gridAreaClassName || 'home-category-layout'}-${index}`}
                    className="min-w-0 flex-[0_0_100%]"
                  >
                    <HomeCategoryCarouselSlide slide={slide} />
                  </div>
                ))}
              </div>
            </div>
            <HomeCategoryCarouselArrowButton
              direction="prev"
              isVisible={showPrevButton}
              disabled={prevBtnDisabled}
              onClick={scrollPrev}
            />
            <HomeCategoryCarouselArrowButton
              direction="next"
              isVisible={showNextButton}
              disabled={nextBtnDisabled}
              onClick={scrollNext}
            />
          </div>
        </div>

        <HomeCategoryCarouselPagination
          scrollSnaps={scrollSnaps}
          selectedIndex={selectedIndex}
          prevBtnDisabled={prevBtnDisabled}
          nextBtnDisabled={nextBtnDisabled}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
          onScrollTo={scrollTo}
        />
      </div>
    </section>
  );
}
