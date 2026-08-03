import { useEffect, useId, useMemo, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { useSearchParams } from 'next/navigation';

import type {
  CatalogProductItem,
  FilterWithOptions,
} from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import {
  areSameCatalogProductList,
  buildProductFilterSelectedMap,
  filterCatalogProductsBySelectedMap,
  getProductFilterPanelClassName,
  getProductFilterPendingContainerClassName,
  getProductFilterTextClassNames,
  getSelectedProductFilterNames,
  parseProductFilterParam,
} from '../productFilter';
import { useProductFilterStore } from '../store/productFilterStore';

import type {
  ProductFilterCheckboxStates,
  ProductFilterVariant,
} from '../productFilter';

type UseProductFilterStateParams = {
  filterItems: FilterWithOptions[] | undefined;
  products: CatalogProductItem[];
  setFilteredItem: Dispatch<SetStateAction<CatalogProductItem[] | null>>;
  variant: ProductFilterVariant;
  checkboxStatesOverride?: ProductFilterCheckboxStates;
  onCheckboxStatesChange?: Dispatch<
    SetStateAction<ProductFilterCheckboxStates>
  >;
  onQueryChange?: () => void;
  syncQueryOnChange: boolean;
  syncFilteredResultOnChange: boolean;
};

export default function useProductFilterState({
  filterItems,
  products,
  setFilteredItem,
  variant,
  checkboxStatesOverride,
  onCheckboxStatesChange,
  onQueryChange,
  syncQueryOnChange,
  syncFilteredResultOnChange,
}: UseProductFilterStateParams) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const { setParam } = useQueryParams();
  const checkboxStates = useProductFilterStore((state) => state.checkboxStates);
  const setCheckboxStates = useProductFilterStore(
    (state) => state.actions.setCheckboxStates,
  );
  const inputIdPrefix = useId();
  const [toggleState, setToggleState] = useState<Record<string, boolean>>({});
  const effectiveCheckboxStates = checkboxStatesOverride ?? checkboxStates;
  const setEffectiveCheckboxStates =
    onCheckboxStatesChange ?? setCheckboxStates;
  const rawFilters = params.get('filters');
  const filtersFromUrl = useMemo(
    () => parseProductFilterParam(rawFilters),
    [rawFilters],
  );
  const selectedFilterMap = useMemo(
    () =>
      buildProductFilterSelectedMap({
        filterItems,
        checkboxStates: effectiveCheckboxStates,
        filtersFromUrl,
      }),
    [effectiveCheckboxStates, filterItems, filtersFromUrl],
  );
  const panelClassName = getProductFilterPanelClassName(variant);
  const pendingContainerClassName =
    getProductFilterPendingContainerClassName(variant);
  const { sectionTitleClassName, optionLabelClassName } =
    getProductFilterTextClassNames(variant);

  const handleToggle = (id: number) => {
    setToggleState((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const checkboxId = Number(value);
    const nextCheckboxStates = {
      ...effectiveCheckboxStates,
      [checkboxId]: checked,
    };

    setEffectiveCheckboxStates(nextCheckboxStates);

    if (!syncQueryOnChange || !filterItems) {
      return;
    }

    const nextFilters = getSelectedProductFilterNames(
      filterItems,
      nextCheckboxStates,
    ).join(',');
    const currentFilters = params.get('filters') ?? '';

    // query string은 공유 가능한 URL을 위한 source이므로 값이 실제로 바뀔 때만 history를 갱신한다.
    if (nextFilters !== currentFilters) {
      onQueryChange?.();
      setParam('filters', nextFilters);
    }
  };

  useEffect(() => {
    if (!syncFilteredResultOnChange) {
      return;
    }

    if (filtersFromUrl.length > 0 && !filterItems?.length) {
      return;
    }

    // URL에서 들어온 filter는 option 목록을 받은 뒤에야 id 기반 selected map으로 변환할 수 있다.
    const nextFilteredItems = filterCatalogProductsBySelectedMap(
      products,
      selectedFilterMap,
    );

    setFilteredItem((prev) =>
      areSameCatalogProductList(prev, nextFilteredItems)
        ? prev
        : nextFilteredItems,
    );
  }, [
    filterItems,
    filtersFromUrl,
    products,
    selectedFilterMap,
    setFilteredItem,
    syncFilteredResultOnChange,
  ]);

  return {
    effectiveCheckboxStates,
    handleCheckboxChange,
    handleToggle,
    inputIdPrefix,
    optionLabelClassName,
    panelClassName,
    pendingContainerClassName,
    sectionTitleClassName,
    toggleState,
  };
}
