import 'server-only';

import type { ProductDetailResponse } from '@entities/product/model/types';

import { getProductPriceInfo } from '@shared/lib/price/discount';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductDetailBySlug(
  slug: string,
): Promise<ProductDetailResponse> {
  const [rawProduct, productDetails] = await Promise.all([
    prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        productLine: true,
        name_en: true,
        slug: true,
        description: true,
        detailed_description: true,
        price: true,
        discountRate: true,
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
            name_ko: true,
            slug: true,
          },
        },
      },
    }),
    prisma.productDetail.findMany({
      where: {
        product: {
          slug,
        },
      },
      select: {
        id: true,
        titleId: true,
        title_middle: true,
        title_sub: true,
        specification: true,
        note: true,
      },
    }),
  ]);
  const parsedPrice = Number(rawProduct?.price);
  const priceInfo = getProductPriceInfo(
    Number.isFinite(parsedPrice) ? parsedPrice : 0,
    rawProduct?.discountRate,
  );
  const product =
    rawProduct === null
      ? null
      : {
          ...rawProduct,
          ...priceInfo,
        };

  return { product, productDetails };
}
