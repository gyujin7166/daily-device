import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';

import { useSearchParams } from 'next/navigation';

import type { FilterWithOptions } from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import {
  getProductFilterPanelClassName,
  getProductFilterPendingContainerClassName,
  getProductFilterTextClassNames,
  getSelectedProductFilterNames,
} from '../productFilter';
import { useProductFilterStore } from '../store/productFilterStore';

import type {
  ProductFilterCheckboxStates,
  ProductFilterVariant,
} from '../productFilter';

type UseProductFilterStateParams = {
  filterItems: FilterWithOptions[] | undefined;
  variant: ProductFilterVariant;
  checkboxStatesOverride?: ProductFilterCheckboxStates;
  onCheckboxStatesChange?: Dispatch<
    SetStateAction<ProductFilterCheckboxStates>
  >;
  onQueryChange?: () => void;
  syncQueryOnChange: boolean;
};

export default function useProductFilterState({
  filterItems,
  variant,
  checkboxStatesOverride,
  onCheckboxStatesChange,
  onQueryChange,
  syncQueryOnChange,
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
  const panelClassName = getProductFilterPanelClassName(variant);
  const pendingContainerClassName =
    getProductFilterPendingContainerClassName(variant);
  const { sectionTitleClassName, optionLabelClassName } =
    getProductFilterTextClassNames(variant);

  const checkboxChangeStateRef = useRef({
    effectiveCheckboxStates,
    filterItems,
    onQueryChange,
    rawFilters,
    setEffectiveCheckboxStates,
    setParam,
    syncQueryOnChange,
  });
  useEffect(() => {
    checkboxChangeStateRef.current = {
      effectiveCheckboxStates,
      filterItems,
      onQueryChange,
      rawFilters,
      setEffectiveCheckboxStates,
      setParam,
      syncQueryOnChange,
    };
  }, [
    effectiveCheckboxStates,
    filterItems,
    onQueryChange,
    rawFilters,
    setEffectiveCheckboxStates,
    setParam,
    syncQueryOnChange,
  ]);

  const handleToggle = useCallback(
    (id: number) => {
      setToggleState((prevState) => ({
        ...prevState,
        [id]: !prevState[id],
      }));
    },
    [setToggleState],
  );

  const handleCheckboxChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value, checked } = event.target;
      const checkboxId = Number(value);
      const {
        effectiveCheckboxStates: currentCheckboxStates,
        filterItems: currentFilterItems,
        onQueryChange: notifyQueryChange,
        rawFilters: currentFilters,
        setEffectiveCheckboxStates: updateCheckboxStates,
        setParam: updateParam,
        syncQueryOnChange: shouldSyncQuery,
      } = checkboxChangeStateRef.current;
      const nextCheckboxStates = {
        ...currentCheckboxStates,
        [checkboxId]: checked,
      };

      updateCheckboxStates(nextCheckboxStates);

      if (!shouldSyncQuery || !currentFilterItems) {
        return;
      }

      const nextFilters = getSelectedProductFilterNames(
        currentFilterItems,
        nextCheckboxStates,
      ).join(',');

      // query string은 공유 가능한 URL을 위한 source이므로 값이 실제로 바뀔 때만 history를 갱신한다.
      if (nextFilters !== (currentFilters ?? '')) {
        notifyQueryChange?.();
        updateParam('filters', nextFilters);
      }
    },
    [],
  );

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
