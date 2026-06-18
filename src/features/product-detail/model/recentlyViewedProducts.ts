import type { ProductDetailResponse } from '@entities/product/model/types';

export const RECENTLY_VIEWED_STORAGE_KEY = 'recently_viewed_products';
export const RECENTLY_VIEWED_VISIBLE_LIMIT = 10;
const RECENTLY_VIEWED_STORAGE_LIMIT = RECENTLY_VIEWED_VISIBLE_LIMIT + 1;

type ProductDetail = NonNullable<ProductDetailResponse['product']>;

export type CarouselProductItem = {
  id: number;
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

const isCarouselProductItem = (
  value: unknown,
): value is CarouselProductItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (!('id' in value) || !('image_url' in value)) {
    return false;
  }

  return typeof value.id === 'number' && typeof value.image_url === 'string';
};

export const parseRecentlyViewedItems = (
  value: string | null,
): CarouselProductItem[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isCarouselProductItem) : [];
  } catch {
    return [];
  }
};

export const createRecentlyViewedItem = (
  product: ProductDetail,
  imageUrl: string,
  href: string,
): CarouselProductItem => ({
  id: product.id,
  image_url: imageUrl,
  alt: product.name_en,
  ...(product.productLine ? { productLine: product.productLine } : {}),
  name: product.name_en.toUpperCase(),
  description: product.description,
  price: product.price > 0 ? product.price : undefined,
  priceLabel: product.priceLabel,
  originalPrice: product.originalPrice,
  originalPriceLabel: product.originalPriceLabel,
  discountedPrice: product.discountedPrice,
  discountedPriceLabel: product.discountedPriceLabel,
  discountRate: product.discountRate,
  isDiscounted: product.isDiscounted,
  href,
  productColor: product.productColor,
  category: product.category
    ? { name_en: product.category.name_en, slug: product.category.slug }
    : undefined,
});

export const getNextRecentlyViewedItems = (
  currentItems: CarouselProductItem[],
  nextItem: CarouselProductItem,
) => {
  const deduped = currentItems.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...deduped].slice(0, RECENTLY_VIEWED_STORAGE_LIMIT);
};
