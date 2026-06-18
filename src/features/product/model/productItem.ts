import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import type { Prisma } from '@prisma/client';

type ProductItemColor = {
  id: number;
  isDefault?: boolean;
  color: {
    name: string;
    hex: string;
  };
};

type ProductItemCategory = {
  name_en?: string | null;
  slug?: string | null;
};

export type ProductItemProduct = {
  id?: number;
  name_en?: string | null;
  slug?: string | null;
  name_ko?: string | null;
  name?: string | null;
  description?: string | null;
  productLine?: string | null;
  price?: number | string | Prisma.Decimal | null;
  priceLabel?: string | null;
  originalPrice?: number | string | Prisma.Decimal | null;
  originalPriceLabel?: string | null;
  discountedPrice?: number | string | Prisma.Decimal | null;
  discountedPriceLabel?: string | null;
  discountRate?: number | null;
  isDiscounted?: boolean | null;
  href?: string | null;
  image_url?: string | null;
  ProductImage?: {
    image_url: string | null;
    isMain?: boolean | null;
    productColorId?: number | null;
    order?: number | null;
  }[];
  category?: ProductItemCategory | null;
  productColor?: ProductItemColor[] | null;
  alt?: string | null;
};

export type ProductItemVariant = 'default' | 'search' | 'catalog';

export type ProductItemSelectedColor = {
  id: number;
  name: string;
  hex: string;
};

export const getDefaultProductItemColor = (
  colors?: ProductItemColor[] | null,
): ProductItemSelectedColor | null => {
  const color = colors?.find((item) => item.isDefault) ?? colors?.[0];

  if (!color) {
    return null;
  }

  return {
    id: color.id,
    name: color.color.name,
    hex: color.color.hex,
  };
};

export const getProductItemViewModel = (
  product: ProductItemProduct,
  selectedColor?: ProductItemSelectedColor | null,
) => {
  const productName = product.name_en ?? product.name_ko ?? product.name ?? '';
  const categorySlug = product.category?.slug ?? product.category?.name_en;
  const productSlug = product.slug?.trim();
  const productHref =
    product.href ??
    getProductHref({
      categorySlug,
      productSlug,
    });
  const imageUrl =
    getProductThumbnailUrlBySelectedColor(
      product.ProductImage,
      selectedColor?.id,
    ) ??
    product.image_url ??
    IMAGE_FALLBACK_URL;
  const price =
    product.priceLabel ??
    (typeof product.price === 'number'
      ? `${product.price.toLocaleString('ko-KR')}원`
      : null);
  const originalPrice =
    product.originalPriceLabel ??
    (typeof product.originalPrice === 'number'
      ? `${product.originalPrice.toLocaleString('ko-KR')}원`
      : null);
  const discountedPrice =
    product.discountedPriceLabel ??
    (typeof product.discountedPrice === 'number'
      ? `${product.discountedPrice.toLocaleString('ko-KR')}원`
      : price);
  const discountRate =
    typeof product.discountRate === 'number'
      ? Math.max(0, Math.trunc(product.discountRate))
      : 0;
  const isDiscounted =
    Boolean(product.isDiscounted) && discountRate > 0 && !!originalPrice;
  const description = product.description?.trim() ?? '';
  const colors = product.productColor ?? [];

  return {
    productName,
    productHref,
    imageUrl,
    imageAlt: product.alt ?? (productName || 'product'),
    price,
    originalPrice,
    discountedPrice,
    discountRate,
    isDiscounted,
    hasPrice: !!price,
    description,
    colors,
    hasColors: colors.length > 0,
    firstColor: getDefaultProductItemColor(colors),
    canAddToCart: typeof product.id === 'number',
  };
};
