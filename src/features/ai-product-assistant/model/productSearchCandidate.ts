import type { CatalogProductItem } from '@entities/product/model/types';

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
