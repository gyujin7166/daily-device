import type {
  CatalogProductItem,
  FilterWithOptions,
} from '@entities/product/model/types';

import type { TransitionStyle } from '@shared/types/transition';

export type ProductFilterCheckboxStates = Record<number, boolean>;
type ProductFilterSelectedMap = Record<string, string[]>;
export type ProductFilterVariant = 'default' | 'drawer';
export type ProductPriceRange = {
  minPrice: number;
  maxPrice: number;
};
export type ProductPriceFilterValue = {
  minPrice?: number;
  maxPrice?: number;
};

export const PRODUCT_FILTER_SECTION_TRANSITION_DURATION = 300;

export const PRODUCT_FILTER_SECTION_DEFAULT_STYLE = {
  transition: `grid-template-rows ${PRODUCT_FILTER_SECTION_TRANSITION_DURATION}ms ease`,
};

export const PRODUCT_FILTER_SECTION_TRANSITION_STYLES: TransitionStyle = {
  entering: {
    gridTemplateRows: '1fr',
  },
  entered: {
    gridTemplateRows: '1fr',
  },
  exiting: {
    gridTemplateRows: '0fr',
  },
  exited: {
    gridTemplateRows: '0fr',
  },
};

export const parseProductFilterParam = (rawFilters?: string | null) =>
  rawFilters
    ? rawFilters
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

const hasCheckedProductFilters = (
  checkboxStates: ProductFilterCheckboxStates,
) => Object.values(checkboxStates).some(Boolean);

/**
 * URL filter 값은 서버에서 받은 옵션명(name_en)이고, 클라이언트 체크박스 상태는 option id다.
 * 아직 사용자가 체크박스를 건드리지 않은 초기 진입에서는 URL 값을 id map으로 변환해 필터 결과를 맞춘다.
 */
export const buildProductFilterSelectedMap = ({
  filterItems,
  checkboxStates,
  filtersFromUrl,
}: {
  filterItems?: FilterWithOptions[];
  checkboxStates: ProductFilterCheckboxStates;
  filtersFromUrl: string[];
}) => {
  const map: ProductFilterSelectedMap = {};
  const hasAnyChecked = hasCheckedProductFilters(checkboxStates);

  filterItems?.forEach((filter) => {
    const checkedIds = filter.filterOption
      .filter((option) => checkboxStates[option.id] === true)
      .map((option) => `${option.id}`);
    const idsFromUrl = filter.filterOption
      .filter((option) => filtersFromUrl.includes(option.name_en))
      .map((option) => `${option.id}`);

    map[`${filter.id}`] =
      filtersFromUrl.length > 0 && !hasAnyChecked ? idsFromUrl : checkedIds;
  });

  return map;
};

export const getSelectedProductFilterNames = (
  filterItems: FilterWithOptions[] | undefined,
  checkboxStates: ProductFilterCheckboxStates,
) =>
  filterItems
    ?.flatMap((item) => item.filterOption)
    .filter((option) => checkboxStates[option.id] === true)
    .map((option) => option.name_en) ?? [];

export const filterCatalogProductsBySelectedMap = (
  products: CatalogProductItem[],
  selectedFilterMap: ProductFilterSelectedMap,
) =>
  products.filter((item) =>
    Object.entries(selectedFilterMap).every(([property, selectedOptions]) => {
      if (!selectedOptions?.length) {
        return true;
      }

      // Prisma JSON filter는 filterId를 문자열 key로 갖는 배열 형태라 런타임에서 좁혀 비교한다.
      const productFilterValues = item?.filter?.[0]?.[property] || [];

      return productFilterValues.some((value) =>
        selectedOptions.includes(`${value}`),
      );
    }),
  );

export const areSameCatalogProductList = (
  prev: CatalogProductItem[] | null | undefined,
  next: CatalogProductItem[],
) =>
  prev?.length === next.length &&
  prev.every((item, index) => item.id === next[index]?.id);

export const getProductFilterPanelClassName = (
  variant: ProductFilterVariant,
) => (variant === 'drawer' ? 'bg-surface dark:bg-dark-panel' : 'space-y-4');

export const getProductFilterPendingContainerClassName = (
  variant: ProductFilterVariant,
) => (variant === 'drawer' ? 'w-full' : 'w-full');

export const getProductFilterTextClassNames = (
  variant: ProductFilterVariant,
) => ({
  sectionTitleClassName:
    variant === 'drawer'
      ? 'text-sm font-semibold uppercase tracking-[0.14em] text-muted dark:text-dark-muted'
      : 'text-xs font-semibold uppercase tracking-[0.14em] text-muted dark:text-dark-muted',
  optionLabelClassName:
    variant === 'drawer'
      ? 'ml-2 cursor-pointer text-base text-ink dark:text-surface'
      : 'ml-2 cursor-pointer text-sm text-ink dark:text-surface',
});
