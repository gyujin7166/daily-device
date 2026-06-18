import 'server-only';

import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import type {
  WishlistItem,
  WishlistMutationItem,
} from '@entities/wishlist/model/types';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { NotFoundError } from '@shared/lib/errors/httpError';
import { getProductPriceInfo } from '@shared/lib/price/discount';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

export async function getWishlistList(userId: string): Promise<WishlistItem[]> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: {
      wishlistItem: {
        orderBy: { createdAt: 'desc' },
        select: {
          product: {
            select: {
              id: true,
              name_en: true,
              slug: true,
              productLine: true,
              description: true,
              price: true,
              discountRate: true,
              ProductImage: {
                where: {
                  OR: [
                    { isMain: true },
                    { order: 1 },
                    { productColorId: { not: null } },
                  ],
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
              category: {
                select: {
                  name_en: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    return [];
  }

  return wishlist.wishlistItem.map(({ product }): WishlistItem => {
    const normalizedProductLine = product.productLine ?? undefined;
    const parsedPrice = Number(product.price);
    const priceInfo = getProductPriceInfo(
      Number.isFinite(parsedPrice) ? parsedPrice : 0,
      product.discountRate,
    );

    const defaultColorId =
      product.productColor.find((color) => color.isDefault)?.id ??
      product.productColor[0]?.id ??
      null;

    return {
      id: product.id,
      image_url:
        getProductThumbnailUrlBySelectedColor(
          product.ProductImage,
          defaultColorId,
        ) ?? IMAGE_FALLBACK_URL,
      ProductImage: product.ProductImage,
      alt: product.name_en,
      ...(normalizedProductLine ? { productLine: normalizedProductLine } : {}),
      name: product.name_en.toUpperCase(),
      description: product.description,
      ...priceInfo,
      href: getProductHref({
        categorySlug: product.category.slug,
        productSlug: product.slug,
      }),
      productColor: product.productColor,
      category: {
        name_en: product.category.name_en,
        slug: product.category.slug,
      },
    };
  });
}

export async function clearWishlist(
  userId: string,
): Promise<Prisma.BatchPayload> {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!wishlist) {
    return { count: 0 };
  }

  return prisma.wishlistItem.deleteMany({
    where: {
      wishlistId: wishlist.id,
    },
  });
}

export async function upsertWishlistItem(
  userId: string,
  productId: number,
): Promise<WishlistMutationItem> {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let wishlist = await tx.wishlist.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wishlist) {
      wishlist = await tx.wishlist.create({
        data: { userId },
        select: { id: true },
      });
    }

    await tx.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return {
      productId,
      isWishlisted: true,
    };
  });
}
