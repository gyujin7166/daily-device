import type { CatalogProductItem } from '@entities/product/model/types';

import type { ProductSearchIntent } from './productSearchIntent';
import type { ProductSearchMapping } from './productSearchMapping';

export type ProductSearchCandidate = Pick<
  CatalogProductItem,
  | 'id'
  | 'slug'
  | 'description'
  | 'originalPrice'
  | 'discountedPrice'
  | 'discountRate'
> & {
  name: string;
  categorySlug: string;
  matchedPreferences: string[];
};

export type ProductAssistantResult = {
  intent: ProductSearchIntent;
  mapping: ProductSearchMapping;
  candidates: ProductSearchCandidate[];
};
