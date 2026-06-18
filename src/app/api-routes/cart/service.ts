import 'server-only';

import type { CartResponse, UserCartItem } from '@entities/cart/model/types';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { BadRequestError, ForbiddenError } from '@shared/lib/errors/httpError';
import { getProductPriceInfo } from '@shared/lib/price/discount';

import prisma from 'prisma/prismaClientSingleton';

import type { CartItem as PrismaCartItem, Prisma } from '@prisma/client';

type UpsertCartItemResult = Pick<
  PrismaCartItem,
  'id' | 'cartId' | 'productId' | 'productColorId' | 'colorName' | 'quantity'
> | null;

type UpsertCartParams = {
  userId: string;
  productId: number;
  quantity: number;
  productColorId?: number;
  colorName?: string;
};

export type DeleteCartParams = {
  userId: string;
  cartItemId?: number;
  productId?: number;
  productColorId?: number;
  colorName?: string;
};

export async function getCartByUserId(userId: string): Promise<CartResponse> {
  const cart = await prisma.cart.findFirst({
    where: { userId },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      cartItem: {
        select: {
          id: true,
          productId: true,
          productColorId: true,
          colorName: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name_en: true,
              slug: true,
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
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      id: 0,
      items: [],
      totalPrice: 0,
    };
  }

  const items: UserCartItem[] = cart.cartItem.map((item) => {
    const { id, name_en, slug, price, discountRate, category, ProductImage } =
      item.product;
    const parsedPrice = Number(price);
    const priceInfo = getProductPriceInfo(
      Number.isFinite(parsedPrice) ? parsedPrice : 0,
      discountRate,
    );

    return {
      id: item.id,
      productId: item.productId,
      productColorId: item.productColorId,
      colorName: item.colorName,
      quantity: item.quantity,
      product: {
        id,
        name_en,
        slug,
        ...priceInfo,
        category: category
          ? {
              name_en: category.name_en,
              slug: category.slug,
            }
          : undefined,
        image_url:
          getProductThumbnailUrlBySelectedColor(
            ProductImage,
            item.productColorId,
          ) ?? IMAGE_FALLBACK_URL,
      },
    };
  });

  const totalPrice = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0,
  );

  return {
    id: cart.id,
    items,
    totalPrice,
  };
}

export async function upsertCartItem(
  params: UpsertCartParams,
): Promise<UpsertCartItemResult> {
  const {
    userId,
    productId,
    quantity: rawQuantity,
    productColorId,
    colorName,
  } = params;
  const quantity = Math.max(0, Math.min(Math.trunc(rawQuantity), 10));

  return prisma.$transaction(async (tx) => {
    let cart = await tx.cart.findFirst({
      where: { userId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });

    if (!cart) {
      cart = await tx.cart.create({ data: { userId } });
    }

    let resolvedProductColorId: number | null | undefined;
    let resolvedColorName: string | null | undefined;

    if (typeof productColorId === 'number') {
      const color = await tx.productColor.findFirst({
        where: {
          id: productColorId,
          productId,
        },
        select: {
          id: true,
          color: { select: { name: true } },
        },
      });

      if (color) {
        resolvedProductColorId = color.id;
        resolvedColorName = color.color.name;
      } else {
        throw new BadRequestError('Selected color option not found');
      }
    } else if (typeof colorName === 'string' && colorName.trim()) {
      resolvedProductColorId = null;
      resolvedColorName = colorName.trim();
    }

    if (quantity === 0) {
      const deleteWhere =
        resolvedProductColorId !== undefined
          ? {
              cartId: cart.id,
              productId,
              productColorId: resolvedProductColorId,
            }
          : {
              cartId: cart.id,
              productId,
              productColorId: null,
              colorName: resolvedColorName ?? null,
            };

      await tx.cartItem.deleteMany({
        where: deleteWhere,
      });
      return null;
    }

    const findWhere =
      resolvedProductColorId !== undefined
        ? {
            cartId: cart.id,
            productId,
            productColorId: resolvedProductColorId,
          }
        : {
            cartId: cart.id,
            productId,
            productColorId: null,
            colorName: resolvedColorName ?? null,
          };

    const existingCartItem = await tx.cartItem.findFirst({
      where: findWhere,
      select: { id: true },
    });

    if (existingCartItem) {
      return tx.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity,
          productColorId: resolvedProductColorId ?? null,
          colorName: resolvedColorName ?? null,
        },
      });
    }

    return tx.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        productColorId: resolvedProductColorId ?? null,
        colorName: resolvedColorName ?? null,
        quantity,
      },
    });
  });
}

export async function deleteCartItems(
  params: DeleteCartParams,
): Promise<Prisma.BatchPayload> {
  const { userId, cartItemId, productId, productColorId, colorName } = params;

  return prisma.$transaction(async (tx) => {
    if (typeof cartItemId === 'number' && Number.isInteger(cartItemId)) {
      const targetItem = await tx.cartItem.findUnique({
        where: {
          id: cartItemId,
        },
        select: {
          cartId: true,
          cart: {
            select: {
              userId: true,
            },
          },
          productId: true,
          productColorId: true,
          colorName: true,
        },
      });

      if (!targetItem) {
        return { count: 0 };
      }

      if (targetItem.cart.userId !== userId) {
        throw new ForbiddenError();
      }

      return tx.cartItem.deleteMany({
        where: {
          cartId: targetItem.cartId,
          productId: targetItem.productId,
          productColorId: targetItem.productColorId,
          colorName: targetItem.colorName,
        },
      });
    }

    if (typeof productId !== 'number') {
      throw new BadRequestError(
        'productId is required when cartItemId is not provided',
      );
    }

    const cart = await tx.cart.findFirst({
      where: { userId },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });

    if (!cart) {
      return { count: 0 };
    }

    return tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
        productColorId:
          typeof productColorId === 'number' ? productColorId : null,
        colorName:
          typeof colorName === 'string' && colorName.trim()
            ? colorName.trim()
            : null,
      },
    });
  });
}
