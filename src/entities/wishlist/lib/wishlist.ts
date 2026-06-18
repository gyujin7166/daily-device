import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import type {
  WishlistItem,
  WishlistProductColor,
} from '@entities/wishlist/model/types';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { isProductLineValue } from '@shared/constants/productLine';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import type { Prisma, ProductLine } from '@prisma/client';

type ProductImage = {
  image_url: string | null;
  isMain?: boolean | null;
  productColorId?: number | null;
  order?: number | null;
};

type WishlistProductSource = {
  id?: number;
  image_url?: string | null;
  ProductImage?: ProductImage[];
  alt?: string | null;
  productLine?: string | null;
  name?: string | null;
  name_en?: string | null;
  slug?: string | null;
  description?: string | null;
  price?: number | string | Prisma.Decimal | null;
  priceLabel?: string | null;
  originalPrice?: number | string | Prisma.Decimal | null;
  originalPriceLabel?: string | null;
  discountedPrice?: number | string | Prisma.Decimal | null;
  discountedPriceLabel?: string | null;
  discountRate?: number | null;
  isDiscounted?: boolean | null;
  href?: string | null;
  productColor?: WishlistProductColor[] | null;
  category?: {
    name_en?: string | null;
    slug?: string | null;
  } | null;
};

const toSlug = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

export const getWishlistLoginPath = (callbackUrl: string) =>
  `/login?callbackUrl=${encodeURIComponent(callbackUrl)}&reason=wishlist`;

export const buildWishlistItem = (
  product: WishlistProductSource,
): WishlistItem | null => {
  if (typeof product.id !== 'number') {
    return null;
  }

  const productName = (
    product.name_en ??
    product.name ??
    product.alt ??
    ''
  ).trim();
  const normalizedProductColor = product.productColor ?? undefined;
  const defaultColorId =
    normalizedProductColor?.find((color) => color.isDefault)?.id ??
    normalizedProductColor?.[0]?.id ??
    null;
  const normalizedProductImages = product.ProductImage?.flatMap((image) => {
    const imageUrl = image.image_url?.trim();

    if (!imageUrl) {
      return [];
    }

    return [
      {
        image_url: imageUrl,
        isMain: image.isMain ?? false,
        productColorId: image.productColorId ?? null,
        order: image.order ?? 0,
      },
    ];
  });
  const imageUrl =
    product.image_url ??
    getProductThumbnailUrlBySelectedColor(
      normalizedProductImages,
      defaultColorId,
    ) ??
    IMAGE_FALLBACK_URL;

  const categoryName = product.category?.name_en?.trim();
  const categorySlug = product.category?.slug?.trim() ?? categoryName;
  const productSlug = product.slug?.trim();
  const href =
    product.href ??
    (categorySlug && productSlug
      ? getProductHref({ categorySlug, productSlug })
      : categorySlug && productName
        ? getProductHref({
            categorySlug,
            productSlug: toSlug(productName),
          })
        : undefined);

  const normalizedPrice =
    typeof product.price === 'number' ? product.price : undefined;
  const normalizedOriginalPrice =
    typeof product.originalPrice === 'number'
      ? product.originalPrice
      : undefined;
  const normalizedDiscountedPrice =
    typeof product.discountedPrice === 'number'
      ? product.discountedPrice
      : undefined;
  const normalizedDiscountRate =
    typeof product.discountRate === 'number' ? product.discountRate : undefined;
  const normalizedName =
    productName.length > 0 ? productName.toUpperCase() : undefined;
  const normalizedProductLine = isProductLineValue(product.productLine)
    ? (product.productLine as ProductLine)
    : undefined;
  const normalizedDescription =
    typeof product.description === 'string' &&
    product.description.trim().length > 0
      ? product.description
      : undefined;
  const normalizedPriceLabel =
    typeof product.priceLabel === 'string' &&
    product.priceLabel.trim().length > 0
      ? product.priceLabel
      : undefined;
  const normalizedOriginalPriceLabel =
    typeof product.originalPriceLabel === 'string' &&
    product.originalPriceLabel.trim().length > 0
      ? product.originalPriceLabel
      : undefined;
  const normalizedDiscountedPriceLabel =
    typeof product.discountedPriceLabel === 'string' &&
    product.discountedPriceLabel.trim().length > 0
      ? product.discountedPriceLabel
      : undefined;
  const normalizedAlt =
    typeof product.alt === 'string' && product.alt.trim().length > 0
      ? product.alt
      : productName || 'product';

  return {
    id: product.id,
    image_url: imageUrl,
    ...(normalizedProductImages && normalizedProductImages.length > 0
      ? { ProductImage: normalizedProductImages }
      : {}),
    alt: normalizedAlt,
    ...(normalizedProductLine ? { productLine: normalizedProductLine } : {}),
    ...(normalizedName ? { name: normalizedName } : {}),
    ...(normalizedDescription ? { description: normalizedDescription } : {}),
    ...(normalizedPrice !== undefined ? { price: normalizedPrice } : {}),
    ...(normalizedPriceLabel ? { priceLabel: normalizedPriceLabel } : {}),
    ...(normalizedOriginalPrice !== undefined
      ? { originalPrice: normalizedOriginalPrice }
      : {}),
    ...(normalizedOriginalPriceLabel
      ? { originalPriceLabel: normalizedOriginalPriceLabel }
      : {}),
    ...(normalizedDiscountedPrice !== undefined
      ? { discountedPrice: normalizedDiscountedPrice }
      : {}),
    ...(normalizedDiscountedPriceLabel
      ? { discountedPriceLabel: normalizedDiscountedPriceLabel }
      : {}),
    ...(normalizedDiscountRate !== undefined
      ? { discountRate: normalizedDiscountRate }
      : {}),
    ...(product.isDiscounted ? { isDiscounted: true } : {}),
    ...(href ? { href } : {}),
    ...(normalizedProductColor ? { productColor: normalizedProductColor } : {}),
    ...(categoryName && categorySlug
      ? { category: { name_en: categoryName, slug: categorySlug } }
      : {}),
  };
};
