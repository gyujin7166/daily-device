import { useSearchParams } from 'next/navigation';

import { IconX } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type {
  FilterWithOptions,
  ProductColorFilterOption,
} from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import {
  selectHasCheckedProductFilters,
  useProductFilterStore,
} from '../model/store/productFilterStore';

import type {
  ProductFilterCheckboxStates,
  ProductPriceFilterValue,
  ProductPriceRange,
} from '../model/productFilter';

type ProductFilterBarProps = {
  filterItems: FilterWithOptions[] | undefined;
  priceRange?: ProductPriceRange;
  priceValue?: ProductPriceFilterValue;
  onPriceChange?: (nextValue: ProductPriceFilterValue) => void;
  colorOptions?: ProductColorFilterOption[];
  selectedColorIds?: number[];
  onColorChange?: (nextColorIds: number[]) => void;
  onQueryChange?: () => void;
};

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

export default function ProductFilterBar({
  filterItems,
  priceRange,
  priceValue = {},
  onPriceChange,
  colorOptions = [],
  selectedColorIds = [],
  onColorChange,
  onQueryChange,
}: ProductFilterBarProps) {
  const locale = useLocale();
  const t = useTranslations('ProductFilter');
  const checkboxStates = useProductFilterStore((state) => state.checkboxStates);
  const hasCheckedFilters = useProductFilterStore(
    selectHasCheckedProductFilters,
  );
  const setCheckboxStates = useProductFilterStore(
    (state) => state.actions.setCheckboxStates,
  );
  const { setParam, setParams } = useQueryParams();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const checkedIds = Object.keys(checkboxStates)
    .filter((key) => checkboxStates[+key])
    .map(Number);

  const checkedNames = filterItems
    ?.flatMap((item) => item.filterOption)
    .filter((option) => checkedIds.includes(option.id))
    .map((option) => option.name_ko);

  const checkedFilters = checkedIds.map((id, index) => ({
    id,
    name: checkedNames && checkedNames[index],
  }));
  const hasActivePriceFilter =
    typeof priceValue.minPrice === 'number' ||
    typeof priceValue.maxPrice === 'number';
  const selectedColorIdSet = new Set(selectedColorIds);
  const selectedColors = colorOptions.filter((color) =>
    selectedColorIdSet.has(color.id),
  );
  const hasActiveColorFilter = selectedColors.length > 0;
  const priceFilterLabel =
    priceRange && hasActivePriceFilter
      ? t('price.activeRange', {
          min: formatPrice(priceValue.minPrice ?? priceRange.minPrice, locale),
          max: formatPrice(priceValue.maxPrice ?? priceRange.maxPrice, locale),
        })
      : null;

  const updateFilterQuery = (
    nextCheckboxStates: ProductFilterCheckboxStates,
  ) => {
    const selectedOptionNames =
      filterItems
        ?.flatMap((item) => item.filterOption)
        .filter((option) => nextCheckboxStates[option.id] === true)
        .map((option) => option.name_en) ?? [];
    const nextFilters = selectedOptionNames.join(',');
    const currentFilters = params.get('filters') ?? '';
    if (nextFilters === currentFilters) {
      return;
    }

    onQueryChange?.();
    setParam('filters', nextFilters);
  };

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {priceFilterLabel && onPriceChange ? (
        <button
          type="button"
          onClick={() => {
            onQueryChange?.();
            onPriceChange({});
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-primary-soft px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-surface dark:border-dark-border dark:bg-dark-panel dark:text-primary dark:hover:bg-dark-panel-hover dark:hover:text-surface"
        >
          <span>{priceFilterLabel}</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface text-primary dark:bg-dark-panel-deep dark:text-primary">
            <IconX size={11} stroke={2.4} />
          </span>
        </button>
      ) : null}
      {onColorChange
        ? selectedColors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => {
                onQueryChange?.();
                onColorChange(
                  selectedColorIds.filter((colorId) => colorId !== color.id),
                );
              }}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-primary-soft px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-surface dark:border-dark-border dark:bg-dark-panel dark:text-primary dark:hover:bg-dark-panel-hover dark:hover:text-surface"
            >
              <span
                className="h-3 w-3 rounded-full border border-line dark:border-dark-border"
                style={{ backgroundColor: color.hex }}
              />
              <span>{color.name}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface text-primary dark:bg-dark-panel-deep dark:text-primary">
                <IconX size={11} stroke={2.4} />
              </span>
            </button>
          ))
        : null}
      {checkedFilters?.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            const nextCheckboxStates = {
              ...checkboxStates,
              [item.id]: false,
            };
            setCheckboxStates(nextCheckboxStates);
            updateFilterQuery(nextCheckboxStates);
          }}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-primary-soft px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-surface dark:border-dark-border dark:bg-dark-panel dark:text-primary dark:hover:bg-dark-panel-hover dark:hover:text-surface"
        >
          <span>{item.name}</span>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-surface text-primary dark:bg-dark-panel-deep dark:text-primary">
            <IconX size={11} stroke={2.4} />
          </span>
        </button>
      ))}
      {(hasCheckedFilters || hasActivePriceFilter || hasActiveColorFilter) && (
        <button
          type="button"
          onClick={() => {
            const nextCheckboxStates = Object.keys(
              checkboxStates,
            ).reduce<ProductFilterCheckboxStates>((acc, key) => {
              acc[+key] = false;
              return acc;
            }, {});
            setCheckboxStates(nextCheckboxStates);
            if (hasActivePriceFilter || hasActiveColorFilter) {
              onQueryChange?.();
              setParams({
                filters: '',
                minPrice: undefined,
                maxPrice: undefined,
                colors: undefined,
              });
              return;
            }
            updateFilterQuery(nextCheckboxStates);
          }}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3 text-xs font-semibold text-ink transition-colors hover:bg-primary-soft hover:text-primary dark:border-dark-border dark:bg-dark-panel-deep dark:text-dark-muted dark:hover:bg-dark-panel-hover dark:hover:text-surface"
        >
          {t('actions.clearAll')}
        </button>
      )}
    </div>
  );
}
