import 'server-only';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getProductPriceInfo } from '@shared/lib/price/discount';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

type RecommendedProductItem = {
  id: number;
  slug: string;
  image_url: string;
  alt: string;
  productLine?: string;
  name: string;
  description: string;
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountRate?: number;
  isDiscounted?: boolean;
  priceLabel?: string;
  originalPriceLabel?: string;
  discountedPriceLabel?: string;
  href: string;
  ProductImage: {
    image_url: string | null;
    isMain: boolean | null;
    productColorId: number | null;
    order: number | null;
  }[];
  productColor: {
    id: number;
    isDefault: boolean;
    color: {
      name: string;
      hex: string;
    };
  }[];
  category: {
    name_en: string;
    slug: string;
  };
};

const baseSelect = {
  id: true,
  name_en: true,
  slug: true,
  description: true,
  productLine: true,
  price: true,
  discountRate: true,
  category: {
    select: {
      name_en: true,
      slug: true,
    },
  },
  ProductImage: {
    where: {
      OR: [{ isMain: true }, { order: 1 }, { productColorId: { not: null } }],
    },
    select: {
      image_url: true,
      isMain: true,
      productColorId: true,
      order: true,
    },
    orderBy: [
      { productColorId: 'asc' },
      { isMain: 'desc' },
      { order: 'asc' },
      { id: 'asc' },
    ],
  },
  productColor: {
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
    select: {
      id: true,
      isDefault: true,
      color: {
        select: {
          name: true,
          hex: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const mapRecommendedItem = (
  product: Prisma.ProductGetPayload<{ select: typeof baseSelect }>,
): RecommendedProductItem => {
  const parsedPrice = Number(product.price);
  const priceInfo = getProductPriceInfo(
    Number.isFinite(parsedPrice) ? parsedPrice : 0,
    product.discountRate,
  );
  const categorySlug = product.category.slug;
  const normalizedProductLine =
    typeof product.productLine === 'string' &&
    product.productLine.trim().length > 0
      ? product.productLine
      : undefined;

  return {
    id: product.id,
    slug: product.slug,
    image_url: product.ProductImage[0]?.image_url ?? IMAGE_FALLBACK_URL,
    alt: product.name_en,
    ...(normalizedProductLine ? { productLine: normalizedProductLine } : {}),
    name: product.name_en.toUpperCase(),
    description: product.description,
    ...priceInfo,
    href: getProductHref({ categorySlug, productSlug: product.slug }),
    ProductImage: product.ProductImage,
    productColor: product.productColor,
    category: {
      name_en: product.category.name_en,
      slug: categorySlug,
    },
  };
};

export async function getRecommendedProductsList({
  category,
  excludeId,
  limit,
}: {
  category?: string;
  excludeId?: number;
  limit: number;
}): Promise<RecommendedProductItem[]> {
  const primaryWhere: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  const primaryProducts = await prisma.product.findMany({
    where: primaryWhere,
    select: baseSelect,
    take: limit,
    orderBy: { id: 'desc' },
  });

  if (!category || primaryProducts.length >= limit) {
    return primaryProducts.map(mapRecommendedItem);
  }

  const excludedIds = [
    ...primaryProducts.map((item) => item.id),
    ...(excludeId ? [excludeId] : []),
  ];

  const fallbackProducts = await prisma.product.findMany({
    where: {
      id: excludedIds.length ? { notIn: excludedIds } : undefined,
      category: { slug: { not: category } },
    },
    select: baseSelect,
    take: limit - primaryProducts.length,
    orderBy: { id: 'desc' },
  });

  return [...primaryProducts, ...fallbackProducts].map(mapRecommendedItem);
}
