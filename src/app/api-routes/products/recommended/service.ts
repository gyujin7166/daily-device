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

type RecommendationContext = 'default' | 'orders-empty' | 'wishlist-empty';
type RecommendedProductPayload = Prisma.ProductGetPayload<{
  select: typeof baseSelect;
}>;

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

const DEFAULT_RECOMMENDED_ORDER_BY = [
  { id: 'desc' },
] satisfies Prisma.ProductOrderByWithRelationInput[];

const shouldShuffleRecommendations = (context: RecommendationContext) =>
  context === 'orders-empty' || context === 'wishlist-empty';

const shuffleProducts = <T,>(items: T[]) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
};

const mapRecommendedItem = (
  product: RecommendedProductPayload,
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
  context = 'default',
  excludeId,
  limit,
}: {
  category?: string;
  context?: RecommendationContext;
  excludeId?: number;
  limit: number;
}): Promise<RecommendedProductItem[]> {
  const primaryWhere: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  if (shouldShuffleRecommendations(context)) {
    const primaryProducts = await prisma.product.findMany({
      where: primaryWhere,
      select: baseSelect,
      orderBy: { id: 'asc' },
    });
    const randomPrimaryProducts = shuffleProducts(primaryProducts).slice(
      0,
      limit,
    );

    if (!category || randomPrimaryProducts.length >= limit) {
      return randomPrimaryProducts.map(mapRecommendedItem);
    }

    const excludedIds = [
      ...randomPrimaryProducts.map((item) => item.id),
      ...(excludeId ? [excludeId] : []),
    ];

    const fallbackProducts = await prisma.product.findMany({
      where: {
        id: excludedIds.length ? { notIn: excludedIds } : undefined,
        category: { slug: { not: category } },
      },
      select: baseSelect,
      orderBy: { id: 'asc' },
    });
    const randomFallbackProducts = shuffleProducts(fallbackProducts).slice(
      0,
      limit - randomPrimaryProducts.length,
    );

    return [...randomPrimaryProducts, ...randomFallbackProducts].map(
      mapRecommendedItem,
    );
  }

  const primaryProducts = await prisma.product.findMany({
    where: primaryWhere,
    select: baseSelect,
    take: limit,
    orderBy: DEFAULT_RECOMMENDED_ORDER_BY,
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
    orderBy: DEFAULT_RECOMMENDED_ORDER_BY,
  });

  return [...primaryProducts, ...fallbackProducts].map(mapRecommendedItem);
}
