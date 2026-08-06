import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { Transition } from 'react-transition-group';

import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';

import {
  PRODUCT_FILTER_SECTION_DEFAULT_STYLE,
  PRODUCT_FILTER_SECTION_TRANSITION_DURATION,
  PRODUCT_FILTER_SECTION_TRANSITION_STYLES,
} from '../model/productFilter';

import type {
  ProductFilterVariant,
  ProductPriceFilterValue,
  ProductPriceRange,
} from '../model/productFilter';

type ProductPriceFilterSectionProps = {
  priceRange: ProductPriceRange;
  value: ProductPriceFilterValue;
  onChange: (nextValue: ProductPriceFilterValue) => void;
  sectionTitleClassName: string;
  variant: ProductFilterVariant;
  containerClassName?: string;
};

const PRICE_STEP = 1000;

const formatPrice = (value: number, locale: string) => {
  if (locale === 'ko') {
    return value.toLocaleString('ko-KR');
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
};

const clampPrice = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getPercent = (value: number, min: number, max: number) => {
  if (max <= min) {
    return 0;
  }

  return ((value - min) / (max - min)) * 100;
};

const resolvePriceValue = (
  value: ProductPriceFilterValue,
  minBound: number,
  maxBound: number,
) => {
  const currentMin = clampPrice(value.minPrice ?? minBound, minBound, maxBound);
  const currentMax = clampPrice(value.maxPrice ?? maxBound, minBound, maxBound);

  return {
    minPrice: Math.min(currentMin, currentMax),
    maxPrice: Math.max(currentMin, currentMax),
  };
};

const toPriceFilterValue = (
  minPrice: number,
  maxPrice: number,
  minBound: number,
  maxBound: number,
): ProductPriceFilterValue => ({
  minPrice: minPrice <= minBound ? undefined : minPrice,
  maxPrice: maxPrice >= maxBound ? undefined : maxPrice,
});

function ProductPriceFilterSection({
  priceRange,
  value,
  onChange,
  sectionTitleClassName,
  variant,
  containerClassName,
}: ProductPriceFilterSectionProps) {
  const locale = useLocale();
  const t = useTranslations('ProductFilter');
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const { minPrice: minBound, maxPrice: maxBound } = priceRange;
  const resolvedValue = useMemo(
    () => resolvePriceValue(value, minBound, maxBound),
    [maxBound, minBound, value],
  );
  const [draftValue, setDraftValue] = useState(resolvedValue);
  const safeMin = draftValue.minPrice;
  const safeMax = draftValue.maxPrice;
  const leftPercent = getPercent(safeMin, minBound, maxBound);
  const rightPercent = 100 - getPercent(safeMax, minBound, maxBound);
  const rangeThumbClassName =
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-line [&::-moz-range-thumb]:bg-surface [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-line [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-md dark:[&::-moz-range-thumb]:border-primary-soft dark:[&::-moz-range-thumb]:bg-dark-bg dark:[&::-moz-range-thumb]:shadow-[0_0_0_2px_rgba(255,255,255,0.08)] dark:[&::-webkit-slider-thumb]:border-primary-soft dark:[&::-webkit-slider-thumb]:bg-dark-bg dark:[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(255,255,255,0.08)]';

  const commitPriceValue = (nextValue = draftValue) => {
    onChange(
      toPriceFilterValue(
        nextValue.minPrice,
        nextValue.maxPrice,
        minBound,
        maxBound,
      ),
    );
  };

  const updateMinPrice = (nextValue: number) => {
    const nextMin = clampPrice(nextValue, minBound, safeMax);
    setDraftValue({
      minPrice: nextMin,
      maxPrice: safeMax,
    });
  };

  const updateMaxPrice = (nextValue: number) => {
    const nextMax = clampPrice(nextValue, safeMin, maxBound);
    setDraftValue({
      minPrice: safeMin,
      maxPrice: nextMax,
    });
  };

  useEffect(() => {
    setDraftValue(resolvedValue);
  }, [resolvedValue]);

  if (maxBound <= minBound) {
    return null;
  }

  return (
    <div
      className={cn(
        containerClassName ??
          'border-t border-line py-4 first:border-t-0 first:pt-0 dark:border-dark-border',
      )}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setIsClosed((prev) => !prev)}
      >
        <p className={sectionTitleClassName}>{t('sections.price')}</p>
        {isClosed ? (
          <IconPlus size={16} className="text-muted dark:text-dark-muted" />
        ) : (
          <IconMinus size={16} className="text-muted dark:text-dark-muted" />
        )}
      </button>

      <Transition
        nodeRef={nodeRef}
        in={!isClosed}
        timeout={PRODUCT_FILTER_SECTION_TRANSITION_DURATION}
        unmountOnExit
      >
        {(state) => (
          <div
            ref={nodeRef}
            className="grid overflow-hidden"
            style={{
              ...PRODUCT_FILTER_SECTION_DEFAULT_STYLE,
              ...getTransitionStyle(
                PRODUCT_FILTER_SECTION_TRANSITION_STYLES,
                state,
              ),
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-3">
                <p className="mb-2 text-md font-bold text-primary dark:text-surface">
                  {t('price.range', {
                    min: formatPrice(safeMin, locale),
                    max: formatPrice(safeMax, locale),
                  })}
                </p>

                <div
                  className={cn(
                    'relative',
                    variant === 'drawer' ? 'h-12' : 'h-11',
                  )}
                >
                  <div className="relative h-full">
                    <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-line dark:bg-dark-border" />
                    <div
                      className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-primary"
                      style={{
                        left: `${leftPercent}%`,
                        right: `${rightPercent}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={minBound}
                      max={maxBound}
                      step={PRICE_STEP}
                      value={safeMin}
                      onChange={(event) =>
                        updateMinPrice(Number(event.target.value))
                      }
                      onPointerUp={() => commitPriceValue()}
                      onBlur={() => commitPriceValue()}
                      aria-label={t('price.minLabel')}
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-1/2 z-10 h-2 w-full -translate-y-1/2 appearance-none bg-transparent',
                        rangeThumbClassName,
                      )}
                    />
                    <input
                      type="range"
                      min={minBound}
                      max={maxBound}
                      step={PRICE_STEP}
                      value={safeMax}
                      onChange={(event) =>
                        updateMaxPrice(Number(event.target.value))
                      }
                      onPointerUp={() => commitPriceValue()}
                      onBlur={() => commitPriceValue()}
                      aria-label={t('price.maxLabel')}
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-1/2 z-20 h-2 w-full -translate-y-1/2 appearance-none bg-transparent',
                        rangeThumbClassName,
                      )}
                    />
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between px-1 text-xs font-bold text-muted dark:text-dark-muted">
                  <span>{t('price.min')}</span>
                  <span>{t('price.max')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
}

export default memo(ProductPriceFilterSection);
