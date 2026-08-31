'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import Image from 'next/image';

import {
  getCloudinaryImageUrl,
  isCloudinaryImageUrl,
} from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';
import { useHeroNavToneStore } from '@shared/model/store/heroNavToneStore';
import type { HeroNavTone } from '@shared/model/store/heroNavToneStore';
import type { ImageWithBlur } from '@shared/types/image';

type HeroPosition = 'start' | 'center' | 'end';
type HeroContentWidth = '1/3' | '1/2';
type HeroTone = HeroNavTone;
type HeroOverlayTone = 'none' | 'dark' | 'light';
type HeroImage = ImageWithBlur & {
  position?: string | null;
  textTone?: string | null;
  navTone?: string | null;
  overlayTone?: string | null;
};

type HeroProps = {
  children: React.ReactNode;
  minHeight: number;
  minHeightClassName?: string;
  imageClassName?: string;
  viewportOffsetTopPx?: number;
  imagesSet?: HeroImage[];
  position?: HeroPosition;
  contentWidth?: HeroContentWidth;
  useImagePosition?: boolean;
  defaultTextTone?: HeroTone;
};

const justifyClasses: Record<HeroPosition, string> = {
  start: 'justify-start text-left',
  center: 'justify-center text-center',
  end: 'justify-end text-right',
};

const itemsClasses: Record<HeroPosition, string> = {
  start: 'items-start ps-0 sm:ps-8 lg:ps-20 xl:ps-24',
  center: 'items-center',
  end: 'items-end pe-0 sm:pe-8 lg:pe-20 xl:pe-24',
};

const widthClasses: Record<HeroContentWidth, string> = {
  '1/2': 'w-full md:w-1/2',
  '1/3': 'w-full md:w-2/3 lg:w-1/3',
};

const textToneClasses: Record<HeroTone, string> = {
  light: 'text-surface',
  dark: 'text-ink',
};

const overlayToneClasses: Record<HeroOverlayTone, string> = {
  none: 'bg-transparent',
  dark: 'bg-black/25',
  light: 'bg-white/25',
};

const normalizePosition = (
  value: string | null | undefined,
  fallback: HeroPosition,
): HeroPosition => {
  if (value === 'center' || value === 'end' || value === 'start') {
    return value;
  }
  return fallback;
};

const normalizeTone = (
  value: string | null | undefined,
  fallback: HeroTone,
): HeroTone => {
  if (value === 'light' || value === 'dark') {
    return value;
  }

  return fallback;
};

export default function Hero({
  children,
  minHeight,
  minHeightClassName,
  imageClassName,
  viewportOffsetTopPx = 0,
  imagesSet,
  position = 'start',
  contentWidth = '1/3',
  useImagePosition = true,
  defaultTextTone = 'dark',
}: HeroProps) {
  const setHeroNavTone = useHeroNavToneStore((state) => state.setHeroNavTone);
  const resetHeroNavTone = useHeroNavToneStore(
    (state) => state.resetHeroNavTone,
  );
  const heroImage = imagesSet?.[0];
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const resolvedTextTone = normalizeTone(heroImage?.textTone, defaultTextTone);
  const resolvedNavTone = normalizeTone(heroImage?.navTone, 'light');
  const resolvedOverlayTone =
    heroImage?.overlayTone === 'dark' || heroImage?.overlayTone === 'light'
      ? heroImage.overlayTone
      : 'none';
  const resolvedPosition = useImagePosition
    ? normalizePosition(heroImage?.position, position)
    : position;
  const isFallbackVisible =
    !heroImage || failedImageSrc === heroImage.image_url;

  useEffect(() => {
    setHeroNavTone(resolvedNavTone);

    return () => {
      resetHeroNavTone();
    };
  }, [resetHeroNavTone, resolvedNavTone, setHeroNavTone]);

  const fallbackStyle: CSSProperties = {
    minHeight: minHeightClassName ? undefined : `${minHeight}vh`,
  };

  const fallbackElement = (
    <div
      className={cn(
        'w-full bg-canvas dark:bg-dark-bg',
        minHeightClassName ?? '',
      )}
      style={fallbackStyle}
    />
  );

  const renderImage = () => {
    if (heroImage && !isFallbackVisible) {
      return (
        <div
          key={heroImage.id}
          className={cn(
            'relative w-full bg-canvas dark:bg-dark-bg',
            minHeightClassName ?? '',
          )}
          style={fallbackStyle}
        >
          {heroImage.blurHash ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${heroImage.blurHash}")` }}
            />
          ) : null}
          <Image
            src={getCloudinaryImageUrl(heroImage.image_url, 'hero')}
            alt=""
            fill
            quality={90}
            unoptimized={isCloudinaryImageUrl(heroImage.image_url)}
            className={cn('object-cover object-center', imageClassName ?? '')}
            draggable={false}
            priority
            sizes="100vw"
            onError={() => setFailedImageSrc(heroImage.image_url)}
          />
        </div>
      );
    }

    return fallbackElement;
  };

  return (
    <div className="relative">
      {renderImage()}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0',
          overlayToneClasses[resolvedOverlayTone],
        )}
      />

      <div className="pointer-events-none absolute inset-0 z-10">
        <section
          className={cn(
            'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10',
            textToneClasses[resolvedTextTone],
            isFallbackVisible && 'dark:text-surface',
          )}
          style={
            viewportOffsetTopPx > 0
              ? {
                  marginTop: `${viewportOffsetTopPx}px`,
                  height: `calc(100% - ${viewportOffsetTopPx}px)`,
                }
              : { height: '100%' }
          }
        >
          <div
            className={cn(
              'flex h-full w-full',
              justifyClasses[resolvedPosition],
              'items-center',
              'py-10 sm:py-14 md:py-20',
            )}
          >
            <div
              className={cn(
                'pointer-events-auto flex flex-col',
                itemsClasses[resolvedPosition],
                widthClasses[contentWidth],
              )}
            >
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
