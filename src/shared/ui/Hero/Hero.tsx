'use client';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

import Image from 'next/image';

import { cn } from '@shared/lib/utils/style';
import { useHeroNavToneStore } from '@shared/model/store/heroNavToneStore';
import type { HeroNavTone } from '@shared/model/store/heroNavToneStore';
import type { ImageWithBlur } from '@shared/types/image';

type HeroPosition = 'start' | 'center' | 'end';
type HeroVerticalPosition = 'start' | 'center' | 'end';
type HeroContentWidth = '1/3' | '1/2' | '2/3' | 'full';
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
  maxHeight?: number;
  minHeightClassName?: string;
  imageClassName?: string;
  viewportOffsetTopPx?: number;
  imgSrc?: string;
  imagesSet?: HeroImage[];
  textColor?: string;
  position?: HeroPosition;
  verticalPosition?: HeroVerticalPosition;
  contentWidth?: HeroContentWidth;
  useImagePosition?: boolean;
  defaultTextTone?: HeroTone;
  defaultNavTone?: HeroTone;
  defaultOverlayTone?: HeroOverlayTone;
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

const verticalClasses: Record<HeroVerticalPosition, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
};

const widthClasses: Record<HeroContentWidth, string> = {
  full: 'w-full',
  '2/3': 'w-full md:w-2/3',
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
  maxHeight,
  minHeightClassName,
  imageClassName,
  viewportOffsetTopPx = 0,
  imgSrc,
  imagesSet,
  textColor,
  position = 'start',
  verticalPosition = 'center',
  contentWidth = '1/3',
  useImagePosition = true,
  defaultTextTone = 'dark',
  defaultNavTone = 'light',
  defaultOverlayTone = 'none',
}: HeroProps) {
  const setHeroNavTone = useHeroNavToneStore((state) => state.setHeroNavTone);
  const resetHeroNavTone = useHeroNavToneStore(
    (state) => state.resetHeroNavTone,
  );
  const heroImage = imagesSet?.[0];
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const resolvedTextTone = normalizeTone(heroImage?.textTone, defaultTextTone);
  const resolvedNavTone = normalizeTone(heroImage?.navTone, defaultNavTone);
  const resolvedOverlayTone =
    heroImage?.overlayTone === 'dark' || heroImage?.overlayTone === 'light'
      ? heroImage.overlayTone
      : defaultOverlayTone;
  const resolvedPosition = useImagePosition
    ? normalizePosition(heroImage?.position, position)
    : position;

  useEffect(() => {
    setHeroNavTone(resolvedNavTone);

    return () => {
      resetHeroNavTone();
    };
  }, [resetHeroNavTone, resolvedNavTone, setHeroNavTone]);

  const fallbackStyle: CSSProperties = {
    minHeight: minHeightClassName ? undefined : `${minHeight}vh`,
    maxHeight: maxHeight ? `${maxHeight}vh` : undefined,
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
    if (heroImage && failedImageSrc !== heroImage.image_url) {
      const imageStyle: CSSProperties = {
        minHeight: minHeightClassName ? undefined : `${minHeight}vh`,
        maxHeight: maxHeight ? `${maxHeight}vh` : undefined,
      };

      return (
        <div
          key={heroImage.id}
          className={cn(
            'relative w-full bg-canvas dark:bg-dark-bg',
            minHeightClassName ?? '',
          )}
          style={imageStyle}
        >
          {heroImage.blurHash ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${heroImage.blurHash}")` }}
            />
          ) : null}
          <Image
            src={heroImage.image_url}
            alt=""
            fill
            quality={90}
            className={cn('object-cover object-center', imageClassName ?? '')}
            draggable={false}
            priority
            sizes="100vw"
            onError={() => setFailedImageSrc(heroImage.image_url)}
          />
        </div>
      );
    }

    if (imgSrc && failedImageSrc !== imgSrc) {
      return (
        <div
          className={cn(
            'relative w-full bg-canvas dark:bg-dark-bg',
            minHeightClassName ?? '',
          )}
          style={fallbackStyle}
        >
          <Image
            src={imgSrc}
            alt=""
            fill
            quality={90}
            className={cn('object-cover object-center', imageClassName ?? '')}
            draggable={false}
            priority
            sizes="100vw"
            onError={() => setFailedImageSrc(imgSrc)}
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
            textColor ?? textToneClasses[resolvedTextTone],
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
              verticalClasses[verticalPosition],
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
