import 'server-only';

import { CLOUDINARY_UPLOAD_ERROR_CODE } from '@shared/constants/cloudinaryUploadErrorCode';
import { ForbiddenError, NotFoundError } from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

const supportedHeroTypes = new Set([
  'main',
  'product',
  'product-all',
  'product-discounts',
]);

export async function getProductUploadFolderData(
  categoryId: number,
  colorId?: number,
) {
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryId },
    select: { slug: true },
  });

  if (!category) {
    throw new NotFoundError(
      'Product category not found.',
      CLOUDINARY_UPLOAD_ERROR_CODE.PRODUCT_CATEGORY_NOT_FOUND,
    );
  }

  if (!colorId) {
    return {
      categorySlug: category.slug,
      colorName: null,
    };
  }

  const color = await prisma.color.findUnique({
    where: { id: colorId },
    select: { name: true },
  });

  if (!color) {
    throw new NotFoundError(
      'Product color not found.',
      CLOUDINARY_UPLOAD_ERROR_CODE.PRODUCT_COLOR_NOT_FOUND,
    );
  }

  return {
    categorySlug: category.slug,
    colorName: color.name,
  };
}

export async function getHeroUploadFolderData(heroTypeId: number) {
  const heroType = await prisma.heroType.findUnique({
    where: { id: heroTypeId },
    select: { name: true },
  });

  if (!heroType) {
    throw new NotFoundError(
      'Hero type not found.',
      CLOUDINARY_UPLOAD_ERROR_CODE.HERO_TYPE_NOT_FOUND,
    );
  }

  if (!supportedHeroTypes.has(heroType.name)) {
    throw new ForbiddenError(
      'This Hero type is not supported.',
      CLOUDINARY_UPLOAD_ERROR_CODE.HERO_TYPE_UNSUPPORTED,
    );
  }

  return {
    heroTypeName: heroType.name,
  };
}

export async function getReviewUploadFolderData(
  userId: string,
  orderItemId: number,
) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      id: orderItemId,
      order: { userId },
    },
    select: {
      id: true,
      product: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!orderItem) {
    throw new NotFoundError(
      'Order item for this review was not found.',
      CLOUDINARY_UPLOAD_ERROR_CODE.REVIEW_ORDER_ITEM_NOT_FOUND,
    );
  }

  return {
    orderItemId: orderItem.id,
    productSlug: orderItem.product.slug,
  };
}
