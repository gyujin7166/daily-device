import type React from 'react';

import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import type {
  HomeCategoryCarouselItem,
  HomeCategoryCarouselSlide as HomeCategoryCarouselSlideType,
} from '../model/homeCategoryCarousel';

type HomeCategoryCarouselSlideProps = {
  slide: HomeCategoryCarouselSlideType;
};

export default function HomeCategoryCarouselSlide({
  slide,
}: HomeCategoryCarouselSlideProps) {
  return (
    <div
      className={cn(
        'grid min-w-0 gap-5 text-sm font-bold text-ink dark:text-surface',
        slide.gridAreaClassName,
      )}
    >
      {slide.items.map((item, index) => (
        <HomeCategoryCarouselItemCard
          key={`${item.href ?? item.label}-${index}`}
          item={item}
        />
      ))}
    </div>
  );
}

function HomeCategoryCarouselItemCard({
  item,
}: {
  item: HomeCategoryCarouselItem;
}) {
  const t = useTranslations('Home.category');
  const isLabelTop = item.labelPosition === 'top';
  const hasImage = item.imageSrc.trim().length > 0;
  const imageSrc = hasImage ? item.imageSrc : IMAGE_FALLBACK_URL;
  const isUnavailableLink = !item.href;
  const label = item.labelKey ? t(item.labelKey) : item.label;
  const ctaLabel = item.cta ?? t('viewCta', { label });
  const handleUnavailableLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!isUnavailableLink) {
      return;
    }

    event.preventDefault();
    toast.info(t('notImplemented'));
  };

  return (
    <div className={cn('group min-w-0', item.areaClassName)}>
      <div className="h-full transition duration-300 group-hover:-translate-y-1 group-focus-within:-translate-y-1">
        <Link
          href={item.href ?? '#'}
          scroll
          onClick={handleUnavailableLinkClick}
          aria-disabled={isUnavailableLink}
          draggable={false}
          className="relative block aspect-4/3 h-full min-h-62 select-none overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 sm:min-h-76 sm:rounded-[26px] lg:aspect-auto lg:min-h-0 dark:border-dark-border dark:bg-dark-panel"
        >
          <div
            className={cn(
              'relative h-full overflow-hidden rounded-xl bg-line sm:rounded-[22px] dark:bg-dark-bg-hover',
              'lg:min-h-40',
            )}
          >
            <Image
              src={getCloudinaryImageUrl(imageSrc, 'homeCard')}
              alt={hasImage ? item.imageAlt : t('imageFallbackAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cn(
                'transition duration-700 group-hover:scale-105 group-focus-within:scale-105',
                hasImage ? 'object-cover' : 'object-contain p-10 opacity-70',
                hasImage ? (item.imageClassName ?? '') : '',
              )}
              draggable={false}
            />
          </div>
          <div
            className={cn(
              'absolute inset-x-7 flex min-w-0 max-w-[calc(100%-56px)] flex-col items-start sm:inset-x-10 sm:max-w-[calc(100%-80px)]',
              hasImage ? 'text-surface' : 'text-ink dark:text-surface',
              isLabelTop ? 'top-7 sm:top-10' : 'bottom-7 sm:bottom-10',
            )}
          >
            <h3 className="max-w-full text-xl font-bold leading-tight tracking-normal break-keep drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-2xl lg:text-3xl">
              {label}
            </h3>
            <span className="mt-3 inline-flex h-11 max-w-full items-center justify-center rounded-xl bg-surface px-6 text-sm font-bold whitespace-nowrap text-ink shadow-xs transition group-hover:bg-surface/90">
              {ctaLabel}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
