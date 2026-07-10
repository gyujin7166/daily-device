import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductItem,
  HeroSummaryItem,
  HeroTypeValue,
  ProductDetailResponse,
  ProductImageItem,
} from '@entities/product/model/types';

import { fetchApi, fetchApiResponse } from '@shared/api/fetchApi';

type ProductPageResponse = {
  items: CatalogProductItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

type RecommendedProductItem = {
  id: number;
  slug: string;
  image_url: string;
  alt: string;
  productLine?: string;
  name?: string;
  description?: string;
  price?: number;
  priceLabel?: string;
  originalPrice?: number;
  originalPriceLabel?: string;
  discountedPrice?: number;
  discountedPriceLabel?: string;
  discountRate?: number;
  isDiscounted?: boolean;
  href?: string;
  ProductImage?: {
    image_url: string | null;
    isMain?: boolean | null;
    productColorId?: number | null;
    order?: number | null;
  }[];
  productColor?: {
    id: number;
    isDefault?: boolean;
    color: {
      name: string;
      hex: string;
    };
  }[];
  category?: {
    name_en: string;
    slug?: string;
  };
};

export const getRecommendedProducts = (
  normalizedCategory: string | undefined,
  excludeId: number | undefined,
  limit: number,
  context?: string,
  locale?: string,
): Promise<RecommendedProductItem[]> => {
  const params = new URLSearchParams();
  if (normalizedCategory) {
    params.set('category', normalizedCategory);
  }
  if (excludeId) {
    params.set('excludeId', `${excludeId}`);
  }
  if (context && context !== 'default') {
    params.set('context', context);
  }
  if (locale) {
    params.set('locale', locale);
  }
  params.set('limit', `${limit}`);
  return fetchApi(`/api/products/recommended?${params.toString()}`);
};

export const getProductImages = (slug: string): Promise<ProductImageItem[]> =>
  fetchApi(`/api/products/${encodeURIComponent(slug)}/images`);

export const getProductDescription = (
  slug: string,
  locale?: string,
): Promise<ProductDetailResponse> => {
  const params = new URLSearchParams();

  if (locale) {
    params.set('locale', locale);
  }

  const query = params.toString();

  return fetchApi(
    `/api/products/${encodeURIComponent(slug)}${query ? `?${query}` : ''}`,
  );
};

export const getProductPage = (
  category: string | undefined,
  page: number,
  limit: number,
  sort: ProductSortOption,
  filters: string[] = [],
  priceRange: {
    minPrice?: number;
    maxPrice?: number;
  } = {},
  colorIds: number[] = [],
  discountedOnly = false,
  locale?: string,
): Promise<ProductPageResponse> => {
  const params = new URLSearchParams({
    page: `${page}`,
    limit: `${limit}`,
    sort,
  });
  if (category) {
    params.set('category', category);
  }
  if (filters.length > 0) {
    params.set('filters', filters.join(','));
  }
  if (colorIds.length > 0) {
    params.set('colors', colorIds.join(','));
  }
  if (typeof priceRange.minPrice === 'number') {
    params.set('minPrice', `${priceRange.minPrice}`);
  }
  if (typeof priceRange.maxPrice === 'number') {
    params.set('maxPrice', `${priceRange.maxPrice}`);
  }
  if (discountedOnly) {
    params.set('discounted', 'true');
  }
  if (locale) {
    params.set('locale', locale);
  }

  return fetchApiResponse(`/api/products?${params.toString()}`);
};

export const getHero = (
  type: HeroTypeValue,
  category: string | undefined,
  locale?: string,
): Promise<HeroSummaryItem[]> => {
  const params = new URLSearchParams({ type });

  if (category) {
    params.set('category', category);
  }
  if (locale) {
    params.set('locale', locale);
  }

  return fetchApi(`/api/products/hero?${params.toString()}`);
};
