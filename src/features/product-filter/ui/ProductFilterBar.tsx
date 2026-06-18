import { useSearchParams } from 'next/navigation';

import { IconX } from '@tabler/icons-react';

import type { ProductColorFilterOption } from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import { useProductFilterContext } from '../model/context/ProductFilterContext';

import type {
  ProductPriceFilterValue,
  ProductPriceRange,
} from '../model/productFilter';

type ProductFilterBarProps = {
  priceRange?: ProductPriceRange;
  priceValue?: ProductPriceFilterValue;
  onPriceChange?: (nextValue: ProductPriceFilterValue) => void;
  colorOptions?: ProductColorFilterOption[];
  selectedColorIds?: number[];
  onColorChange?: (nextColorIds: number[]) => void;
};

const formatPrice = (value: number) => value.toLocaleString('ko-KR');

export default function ProductFilterBar({
  priceRange,
  priceValue = {},
  onPriceChange,
  colorOptions = [],
  selectedColorIds = [],
  onColorChange,
}: ProductFilterBarProps) {
  const { checkboxStates, setCheckboxStates, hasCheckedFilters, filter } =
    useProductFilterContext();
  const { setParam, setParams } = useQueryParams();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  type CheckboxStates = typeof checkboxStates;
  const checkedIds = Object.keys(checkboxStates)
    .filter((key) => checkboxStates[+key])
    .map(Number);

  const checkedNames = filter
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
      ? `가격 ${formatPrice(priceValue.minPrice ?? priceRange.minPrice)}원 - ${formatPrice(priceValue.maxPrice ?? priceRange.maxPrice)}원`
      : null;

  const updateFilterQuery = (nextCheckboxStates: CheckboxStates) => {
    const selectedOptionNames =
      filter
        ?.flatMap((item) => item.filterOption)
        .filter((option) => nextCheckboxStates[option.id] === true)
        .map((option) => option.name_en) ?? [];
    const nextFilters = selectedOptionNames.join(',');
    const currentFilters = params.get('filters') ?? '';
    if (nextFilters === currentFilters) {
      return;
    }

    setParam('filters', nextFilters);
  };

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {priceFilterLabel && onPriceChange ? (
        <button
          type="button"
          onClick={() => onPriceChange({})}
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
              onClick={() =>
                onColorChange(
                  selectedColorIds.filter((colorId) => colorId !== color.id),
                )
              }
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
            ).reduce<CheckboxStates>((acc, key) => {
              acc[+key] = false;
              return acc;
            }, {});
            setCheckboxStates(nextCheckboxStates);
            if (hasActivePriceFilter || hasActiveColorFilter) {
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
          모두 지우기
        </button>
      )}
    </div>
  );
}
