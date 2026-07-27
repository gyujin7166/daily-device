'use client';
import { Suspense } from 'react';

import ProductAllContentContainer from './ProductAllContentContainer';
import ProductAllHeroContainer from './ProductAllHeroContainer';
import ProductAllLoadingState from './ProductAllLoadingState';

type ProductAllPageContainerProps = {
  discountedOnly?: boolean;
};

export default function ProductAllPageContainer({
  discountedOnly = false,
}: ProductAllPageContainerProps) {
  return (
    <div className="bg-canvas text-ink dark:bg-dark-bg dark:text-surface">
      <ProductAllHeroContainer discountedOnly={discountedOnly} />
      <Suspense fallback={<ProductAllLoadingState />}>
        <ProductAllContentContainer discountedOnly={discountedOnly} />
      </Suspense>
    </div>
  );
}
