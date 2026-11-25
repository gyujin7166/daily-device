import type React from 'react';

import Image from 'next/image';

import { IconArrowRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';
import {
  getCloudinaryImageUrl,
  isCloudinaryImageUrl,
} from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

import type { HomeCategoryCarouselItem } from '../model/homeCategoryCarousel';

type HomeCategoryCarouselSlideProps = {
  item: HomeCategoryCarouselItem;
};

export default function HomeCategoryCarouselSlide({
  item,
}: HomeCategoryCarouselSlideProps) {
  const t = useTranslations('Home.category');
  const isLabelTop = item.labelPosition === 'top';
  const hasImage = item.imageSrc.trim().length > 0;
  const imageSrc = hasImage ? item.imageSrc : IMAGE_FALLBACK_URL;
  const isUnavailableLink = !item.href;
  const label = item.labelKey ? t(item.labelKey) : item.label;
  const ctaLabel = item.cta ?? t('viewCta');
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
    <Link
      href={item.href ?? '#'}
      scroll
      onClick={handleUnavailableLinkClick}
      aria-disabled={isUnavailableLink}
      draggable={false}
      className="group relative block aspect-4/5 select-none overflow-hidden rounded-2xl border border-line bg-line focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary sm:rounded-3xl dark:border-dark-border dark:bg-dark-bg-hover"
    >
      <Image
        src={getCloudinaryImageUrl(imageSrc, 'homeCard')}
        alt={hasImage ? item.imageAlt : t('imageFallbackAlt')}
        fill
        unoptimized={isCloudinaryImageUrl(imageSrc)}
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 320px"
        className={cn(
          'transition duration-700 group-hover:scale-105 group-focus-visible:scale-105',
          hasImage ? 'object-cover' : 'object-contain p-10 opacity-70',
          hasImage ? (item.imageClassName ?? '') : '',
        )}
        draggable={false}
      />
      {hasImage ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 h-1/2 from-black/55 to-transparent',
            isLabelTop ? 'top-0 bg-linear-to-b' : 'bottom-0 bg-linear-to-t',
          )}
        />
      ) : null}
      <div
        className={cn(
          'absolute inset-x-5 flex min-w-0 flex-col items-start gap-2 sm:inset-x-6',
          hasImage ? 'text-surface' : 'text-ink dark:text-surface',
          isLabelTop ? 'top-5 sm:top-6' : 'bottom-5 sm:bottom-6',
        )}
      >
        <h3 className="max-w-full text-xl font-bold leading-tight tracking-normal break-keep sm:text-2xl">
          {label}
        </h3>
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          {ctaLabel}
          <IconArrowRight
            aria-hidden
            size={16}
            stroke={2}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
