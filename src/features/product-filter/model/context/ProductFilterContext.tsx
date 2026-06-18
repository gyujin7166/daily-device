'use client';
import type { SetStateAction } from 'react';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useParams, useSearchParams } from 'next/navigation';

import type { FilterWithOptions } from '@entities/product/model/types';

import { useQueryParams } from '@shared/lib/router/useQueryParams';

import { useProductFilter } from '../../queries/useProductFilter';

type CheckboxStates = Record<number, boolean>;
type FilterState = Record<number, string[]>;

type ProductFilterContextType = {
  filter: FilterWithOptions[] | undefined;
  filterIsPending: boolean;
  visibleFilter: boolean;
  setVisibleFilter: React.Dispatch<SetStateAction<boolean>>;
  checkboxStates: CheckboxStates;
  setCheckboxStates: React.Dispatch<SetStateAction<CheckboxStates>>;
  filterState: FilterState;
  setFilterState: React.Dispatch<SetStateAction<FilterState>>;
  hasCheckedFilters: boolean;
};

const ProductFilterContext = createContext<
  ProductFilterContextType | undefined
>(undefined);

export const useProductFilterContext = () => {
  const context = useContext(ProductFilterContext);

  if (context === undefined) {
    throw new Error(
      'useProductFilterContext must be used within a ProductFilterProvider',
    );
  }

  return context;
};

export default function ProductFilterProvider({
  children,
}: React.PropsWithChildren) {
  const routeParams = useParams<{ category?: string }>();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const { setParam } = useQueryParams();
  const category = routeParams?.category;
  const { data: filter, isPending: filterIsPending } =
    useProductFilter(category);
  const [checkboxStates, setCheckboxStates] = useState<CheckboxStates>({});
  const [filterState, setFilterState] = useState<FilterState>({});
  const [visibleFilter, setVisibleFilter] = useState(true);
  const currentFilters = params.get('filters');
  const prevFilters = useRef(currentFilters);

  const hasCheckedFilters = Object.values(checkboxStates).some(
    (value) => value,
  );

  useEffect(() => {
    if (prevFilters.current && !currentFilters) {
      setCheckboxStates((prev) => (Object.keys(prev).length > 0 ? {} : prev));
      setFilterState((prev) => (Object.keys(prev).length > 0 ? {} : prev));
    } else if (currentFilters && filter) {
      const filterArray = currentFilters
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      const validFilterNames = new Set(
        filter.flatMap((group) =>
          group.filterOption.map((option) => option.name_en),
        ),
      );
      const hasInvalidFilter = filterArray.some(
        (value) => !validFilterNames.has(value),
      );

      if (hasInvalidFilter) {
        setParam('filters', null);
        prevFilters.current = currentFilters;
        return;
      }

      const newCheckboxStates: CheckboxStates = {};
      const newFilterState: FilterState = {};

      filter?.forEach((category) => {
        category.filterOption.forEach((option) => {
          newCheckboxStates[option.id] = filterArray.includes(option.name_en);
        });

        const checkedOptions = category.filterOption
          .filter((option) => filterArray.includes(option.name_en))
          .map((option) => `${option.id}`);

        newFilterState[category.id] = checkedOptions;
      });

      setCheckboxStates((prev) =>
        JSON.stringify(prev) === JSON.stringify(newCheckboxStates)
          ? prev
          : newCheckboxStates,
      );
      setFilterState((prev) =>
        JSON.stringify(prev) === JSON.stringify(newFilterState)
          ? prev
          : newFilterState,
      );
    }

    prevFilters.current = currentFilters;
  }, [currentFilters, filter, setParam]);

  return (
    <ProductFilterContext.Provider
      value={{
        filter,
        filterIsPending,
        visibleFilter,
        setVisibleFilter,
        checkboxStates,
        setCheckboxStates,
        filterState,
        setFilterState,
        hasCheckedFilters,
      }}
    >
      {children}
    </ProductFilterContext.Provider>
  );
}
