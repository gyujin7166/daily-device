import 'server-only';

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
    throw new NotFoundError('상품 카테고리를 찾을 수 없습니다.');
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
    throw new NotFoundError('상품 색상을 찾을 수 없습니다.');
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
    throw new NotFoundError('Hero 타입을 찾을 수 없습니다.');
  }

  if (!supportedHeroTypes.has(heroType.name)) {
    throw new ForbiddenError('지원하지 않는 Hero 타입입니다.');
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
    throw new NotFoundError('상품평을 작성할 주문 상품을 찾을 수 없습니다.');
  }

  return {
    orderItemId: orderItem.id,
    productSlug: orderItem.product.slug,
  };
}
