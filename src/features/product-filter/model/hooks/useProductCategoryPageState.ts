import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
  CatalogProductItem,
  FilterWithOptions,
} from '@entities/product/model/types';

import {
  areSameCatalogProductList,
  buildProductFilterSelectedMap,
  filterCatalogProductsBySelectedMap,
  getSelectedProductFilterNames,
  parseProductFilterParam,
} from '../productFilter';

import type { ProductFilterCheckboxStates } from '../productFilter';

type UseProductCategoryPageStateParams = {
  currentFilters: string | null;
  onReplaceFilters: (nextFilters: string) => void;
  visibleFilter: boolean;
  setVisibleFilter: Dispatch<SetStateAction<boolean>>;
  filterItems: FilterWithOptions[] | undefined;
  filterIsPending: boolean;
  checkboxStates: ProductFilterCheckboxStates;
  setCheckboxStates: Dispatch<SetStateAction<ProductFilterCheckboxStates>>;
  products: CatalogProductItem[];
  productsIsFetching: boolean;
  productListResetKey: string;
};

type FilteredItemState = {
  resetKey: string;
  items: CatalogProductItem[];
};

export default function useProductCategoryPageState({
  currentFilters,
  onReplaceFilters,
  visibleFilter,
  setVisibleFilter,
  filterItems,
  filterIsPending,
  checkboxStates,
  setCheckboxStates,
  products,
  productsIsFetching,
  productListResetKey,
}: UseProductCategoryPageStateParams) {
  const [filteredItemState, setFilteredItemState] =
    useState<FilteredItemState | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileDraftCheckboxStates, setMobileDraftCheckboxStates] =
    useState<ProductFilterCheckboxStates | null>(null);
  const [isMobileDraftDirty, setIsMobileDraftDirty] = useState(false);
  const rawFilters = (currentFilters ?? '').trim();
  const filtersFromUrl = useMemo(
    () => parseProductFilterParam(rawFilters),
    [rawFilters],
  );

  const hasFilterQuery = rawFilters.length > 0;
  const filteredItem =
    filteredItemState?.resetKey === productListResetKey
      ? filteredItemState.items
      : null;
  const shouldWaitFilteredResult =
    hasFilterQuery && (filterIsPending || filteredItem === null);
  const selectedFilterMap = useMemo(
    () =>
      buildProductFilterSelectedMap({
        filterItems,
        checkboxStates,
        filtersFromUrl,
      }),
    [checkboxStates, filterItems, filtersFromUrl],
  );

  const closeMobileFilterDrawer = useCallback(() => {
    setMobileDraftCheckboxStates(null);
    setIsMobileDraftDirty(false);
    setVisibleFilter(false);
  }, [setIsMobileDraftDirty, setMobileDraftCheckboxStates, setVisibleFilter]);
  const setFilteredItem: Dispatch<SetStateAction<CatalogProductItem[] | null>> =
    useCallback(
      (next) => {
        setFilteredItemState((prev) => {
          const prevItems =
            prev?.resetKey === productListResetKey ? prev.items : null;
          const nextItems = typeof next === 'function' ? next(prevItems) : next;

          return nextItems === null
            ? null
            : { resetKey: productListResetKey, items: nextItems };
        });
      },
      [productListResetKey],
    );

  const updateFilterQuery = useCallback(
    (
      nextCheckboxStates: ProductFilterCheckboxStates,
      replaceFilters = onReplaceFilters,
    ) => {
      const nextFilters = getSelectedProductFilterNames(
        filterItems,
        nextCheckboxStates,
      ).join(',');
      if (nextFilters === rawFilters) {
        return;
      }

      replaceFilters(nextFilters);
    },
    [filterItems, onReplaceFilters, rawFilters],
  );

  const handleApplyMobileFilters = useCallback(
    (replaceFilters?: (nextFilters: string) => void) => {
      const nextCheckboxStates = mobileDraftCheckboxStates ?? checkboxStates;
      // 모바일 drawer는 적용 전까지 전역 필터를 바꾸지 않는 draft 모델을 사용한다.
      setCheckboxStates(nextCheckboxStates);
      updateFilterQuery(nextCheckboxStates, replaceFilters);
      closeMobileFilterDrawer();
    },
    [
      checkboxStates,
      closeMobileFilterDrawer,
      mobileDraftCheckboxStates,
      setCheckboxStates,
      updateFilterQuery,
    ],
  );

  const handleMobileDraftCheckboxStatesChange: Dispatch<
    SetStateAction<ProductFilterCheckboxStates>
  > = useCallback(
    (next) => {
      setIsMobileDraftDirty(true);
      setMobileDraftCheckboxStates((prev) =>
        typeof next === 'function' ? next(prev ?? {}) : next,
      );
    },
    [setIsMobileDraftDirty, setMobileDraftCheckboxStates],
  );

  const handleResetMobileDraft = useCallback(() => {
    setIsMobileDraftDirty(true);
    setMobileDraftCheckboxStates({});
  }, [setIsMobileDraftDirty, setMobileDraftCheckboxStates]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const syncViewport = () => {
      const nextIsMobile = mediaQuery.matches;

      setIsMobileViewport(nextIsMobile);
      setVisibleFilter(!nextIsMobile);
    };
    const handleViewportChange = (event: MediaQueryListEvent) => {
      const nextIsMobile = event.matches;
      setIsMobileViewport(nextIsMobile);
      setVisibleFilter(!nextIsMobile);
    };

    syncViewport();
    mediaQuery.addEventListener('change', handleViewportChange);

    return () => {
      mediaQuery.removeEventListener('change', handleViewportChange);
    };
  }, [setVisibleFilter]);

  useEffect(() => {
    if (!isMobileViewport || !visibleFilter || isMobileDraftDirty) {
      return;
    }

    // drawer를 처음 열 때만 현재 필터를 복사해 사용자가 수정한 draft를 외부 상태 변경에서 보호한다.
    setMobileDraftCheckboxStates({ ...checkboxStates });
  }, [checkboxStates, isMobileViewport, isMobileDraftDirty, visibleFilter]);

  useEffect(() => {
    if (productsIsFetching && products.length === 0) {
      return;
    }

    if (hasFilterQuery && filterIsPending) {
      return;
    }

    const nextFilteredItems = filterCatalogProductsBySelectedMap(
      products,
      selectedFilterMap,
    );

    setFilteredItemState((prev) => {
      const prevItems =
        prev?.resetKey === productListResetKey ? prev.items : null;

      return areSameCatalogProductList(prevItems, nextFilteredItems)
        ? prev
        : { resetKey: productListResetKey, items: nextFilteredItems };
    });
  }, [
    filterIsPending,
    hasFilterQuery,
    productListResetKey,
    products,
    productsIsFetching,
    selectedFilterMap,
  ]);

  return {
    filteredItem,
    setFilteredItem,
    isMobileViewport,
    mobileDraftCheckboxStates,
    shouldWaitFilteredResult,
    closeMobileFilterDrawer,
    handleApplyMobileFilters,
    handleMobileDraftCheckboxStatesChange,
    handleResetMobileDraft,
  };
}
