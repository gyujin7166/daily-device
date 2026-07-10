import type { ProductSortOption } from '@entities/product/model/sort';
import type { HeroTypeValue } from '@entities/product/model/types';

type ProductListQueryKeyParams = {
  category?: string;
  locale?: string;
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
  categories: (locale?: string) =>
    [...productQueryKeys.all, 'categories', locale] as const,
  heroes: () => [...productQueryKeys.all, 'hero'] as const,
  hero: (type: HeroTypeValue, category?: string, locale?: string) =>
    [...productQueryKeys.heroes(), type, category, locale] as const,
  list: (params: ProductListQueryKeyParams) =>
    [...productQueryKeys.all, 'list', params] as const,
  detail: (slug: string, locale?: string) =>
    [...productQueryKeys.all, 'detail', slug, locale] as const,
  images: (slug: string) => [...productQueryKeys.all, 'images', slug] as const,
  recommended: (
    category?: string,
    excludeId?: number,
    limit = 10,
    context = 'default',
    locale?: string,
  ) =>
    [
      ...productQueryKeys.all,
      'recommended',
      category,
      excludeId,
      limit,
      context,
      locale,
    ] as const,
};
