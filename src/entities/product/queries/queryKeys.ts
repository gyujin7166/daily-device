import type { ProductSortOption } from '@entities/product/model/sort';
import type { HeroTypeValue } from '@entities/product/model/types';

type ProductListQueryKeyParams = {
  category?: string;
  sort: ProductSortOption;
  pageSize: number;
  filtersKey: string;
  colorsKey?: string;
  minPrice?: number;
  maxPrice?: number;
  discountedOnly?: boolean;
};

export const productQueryKeys = {
  all: ['products'] as const,
  categories: () => [...productQueryKeys.all, 'categories'] as const,
  heroes: () => [...productQueryKeys.all, 'hero'] as const,
  hero: (type: HeroTypeValue, category?: string) =>
    [...productQueryKeys.heroes(), type, category] as const,
  list: (params: ProductListQueryKeyParams) =>
    [...productQueryKeys.all, 'list', params] as const,
  detail: (slug: string) => [...productQueryKeys.all, 'detail', slug] as const,
  images: (slug: string) => [...productQueryKeys.all, 'images', slug] as const,
  recommended: (category?: string, excludeId?: number, limit = 10) =>
    [
      ...productQueryKeys.all,
      'recommended',
      category,
      excludeId,
      limit,
    ] as const,
};
