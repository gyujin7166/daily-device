import { useEffect } from 'react';

import type { FilterWithOptions } from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import { parseProductFilterParam } from '../productFilter';
import { useProductFilterStore } from '../store/productFilterStore';

type UseProductFilterUrlSyncParams = {
  currentFilters: string | null;
  filterItems: FilterWithOptions[] | undefined;
};

export default function useProductFilterUrlSync({
  currentFilters,
  filterItems,
}: UseProductFilterUrlSyncParams) {
  const { setParam } = useQueryParams();
  const setCheckboxStates = useProductFilterStore(
    (state) => state.actions.setCheckboxStates,
  );

  useEffect(() => {
    const filterNames = parseProductFilterParam(currentFilters);

    if (filterNames.length === 0) {
      setCheckboxStates({});
      return;
    }

    if (!filterItems) {
      return;
    }

    const validFilterNames = new Set(
      filterItems.flatMap((group) =>
        group.filterOption.map((option) => option.name_en),
      ),
    );
    const hasInvalidFilter = filterNames.some(
      (filterName) => !validFilterNames.has(filterName),
    );

    if (hasInvalidFilter) {
      setCheckboxStates({});
      setParam('filters', null);
      return;
    }

    const selectedFilterNames = new Set(filterNames);
    const checkboxStates = Object.fromEntries(
      filterItems.flatMap((group) =>
        group.filterOption.map((option) => [
          option.id,
          selectedFilterNames.has(option.name_en),
        ]),
      ),
    );
    setCheckboxStates(checkboxStates);
  }, [currentFilters, filterItems, setCheckboxStates, setParam]);
}
