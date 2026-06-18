import React from 'react';

import type {
  CatalogProductItem,
  ProductColorFilterOption,
  FilterWithOptions,
} from '@entities/product/model/types';

import useProductFilterState from '../model/hooks/useProductFilterState';
import {
  PRODUCT_FILTER_SECTION_DEFAULT_STYLE,
  PRODUCT_FILTER_SECTION_TRANSITION_DURATION,
  PRODUCT_FILTER_SECTION_TRANSITION_STYLES,
} from '../model/productFilter';

import ProductColorFilterSection from './ProductColorFilterSection';
import ProductFilterSection from './ProductFilterSection';
import ProductFilterSkeleton from './ProductFilterSkeleton';
import ProductPriceFilterSection from './ProductPriceFilterSection';

import type {
  ProductFilterCheckboxStates,
  ProductFilterVariant,
  ProductPriceFilterValue,
  ProductPriceRange,
} from '../model/productFilter';

type FilterProps = {
  filterItems: FilterWithOptions[] | undefined;
  products: CatalogProductItem[];
  setFilteredItem: React.Dispatch<
    React.SetStateAction<CatalogProductItem[] | null>
  >;
  variant?: ProductFilterVariant;
  checkboxStatesOverride?: ProductFilterCheckboxStates;
  onCheckboxStatesChange?: React.Dispatch<
    React.SetStateAction<ProductFilterCheckboxStates>
  >;
  priceRange?: ProductPriceRange;
  priceValue?: ProductPriceFilterValue;
  onPriceChange?: (nextValue: ProductPriceFilterValue) => void;
  colorOptions?: ProductColorFilterOption[];
  selectedColorIds?: number[];
  onColorChange?: (nextColorIds: number[]) => void;
  syncQueryOnChange?: boolean;
  syncFilteredResultOnChange?: boolean;
};

export default function ProductFilter({
  filterItems,
  products,
  setFilteredItem,
  variant = 'default',
  checkboxStatesOverride,
  onCheckboxStatesChange,
  priceRange,
  priceValue = {},
  onPriceChange,
  colorOptions = [],
  selectedColorIds = [],
  onColorChange,
  syncQueryOnChange = true,
  syncFilteredResultOnChange = true,
}: FilterProps) {
  const sectionContainerClassName =
    variant === 'drawer'
      ? undefined
      : 'rounded-3xl border border-line bg-surface p-5 shadow-xs dark:border-dark-border dark:bg-dark-panel';
  const {
    effectiveCheckboxStates,
    filterIsPending,
    handleCheckboxChange,
    handleToggle,
    inputIdPrefix,
    optionLabelClassName,
    panelClassName,
    pendingContainerClassName,
    sectionTitleClassName,
    toggleState,
  } = useProductFilterState({
    filterItems,
    products,
    setFilteredItem,
    variant,
    checkboxStatesOverride,
    onCheckboxStatesChange,
    syncQueryOnChange,
    syncFilteredResultOnChange,
  });

  if (filterIsPending) {
    return <ProductFilterSkeleton className={pendingContainerClassName} />;
  }

  return (
    <div className="w-full">
      <div className={panelClassName}>
        {priceRange && onPriceChange ? (
          <ProductPriceFilterSection
            priceRange={priceRange}
            value={priceValue}
            onChange={onPriceChange}
            sectionTitleClassName={sectionTitleClassName}
            variant={variant}
            containerClassName={sectionContainerClassName}
          />
        ) : null}
        {onColorChange ? (
          <ProductColorFilterSection
            colorOptions={colorOptions}
            selectedColorIds={selectedColorIds}
            onChange={onColorChange}
            sectionTitleClassName={sectionTitleClassName}
            variant={variant}
            containerClassName={sectionContainerClassName}
          />
        ) : null}
        {filterItems?.map((filter) => {
          return (
            <ProductFilterSection
              key={filter.id}
              filter={filter}
              isClosed={!!toggleState[filter.id]}
              onToggle={handleToggle}
              inputIdPrefix={inputIdPrefix}
              effectiveCheckboxStates={effectiveCheckboxStates}
              onCheckboxChange={handleCheckboxChange}
              sectionTitleClassName={sectionTitleClassName}
              optionLabelClassName={optionLabelClassName}
              containerClassName={sectionContainerClassName}
              duration={PRODUCT_FILTER_SECTION_TRANSITION_DURATION}
              defaultStyle={PRODUCT_FILTER_SECTION_DEFAULT_STYLE}
              transitionStyles={PRODUCT_FILTER_SECTION_TRANSITION_STYLES}
            />
          );
        })}
      </div>
    </div>
  );
}
