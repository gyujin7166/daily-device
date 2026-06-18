import 'server-only';

import type { CategoryItems } from '@entities/category/model/types';

import prisma from 'prisma/prismaClientSingleton';

export async function getCategoryList(): Promise<CategoryItems[]> {
  return prisma.productCategory.findMany({
    where: {
      parentId: null,
      isVisible: true,
    },
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      slug: true,
      image_url: true,
      displayOrder: true,
      children: {
        where: {
          isVisible: true,
        },
        select: {
          id: true,
          name_en: true,
          name_ko: true,
          slug: true,
          displayOrder: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { name_ko: 'asc' }],
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { name_ko: 'asc' }],
  });
}
