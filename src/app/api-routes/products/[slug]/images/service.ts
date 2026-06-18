import 'server-only';

import type { ProductImageItem } from '@entities/product/model/types';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductImageListBySlug(
  slug: string,
): Promise<ProductImageItem[]> {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      ProductImage: {
        select: {
          id: true,
          image_url: true,
          order: true,
          isMain: true,
          productColorId: true,
        },
        orderBy: [{ productColorId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
      },
    },
  });

  return product?.ProductImage ?? [];
}
