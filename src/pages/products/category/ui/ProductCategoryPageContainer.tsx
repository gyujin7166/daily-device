'use client';
import { Suspense } from 'react';

import type { ProductPriceRange } from '@features/product-filter/model/productFilter';

import type { ProductColorFilterOption } from '@entities/product/model/types';

import ProductCategoryContentContainer from './ProductCategoryContentContainer';
import ProductCategoryHeroContainer from './ProductCategoryHeroContainer';
import ProductCategoryLoadingState from './ProductCategoryLoadingState';

type ProductCategoryPageContainerProps = {
  category: string;
  priceRange: ProductPriceRange;
  colorOptions: ProductColorFilterOption[];
};

export default function ProductCategoryPageContainer({
  category,
  priceRange,
  colorOptions,
}: ProductCategoryPageContainerProps) {
  return (
    <div className="bg-canvas dark:bg-dark-bg">
      <ProductCategoryHeroContainer category={category} />
      <Suspense fallback={<ProductCategoryLoadingState />}>
        <ProductCategoryContentContainer
          category={category}
          priceRange={priceRange}
          colorOptions={colorOptions}
        />
      </Suspense>
    </div>
  );
}
