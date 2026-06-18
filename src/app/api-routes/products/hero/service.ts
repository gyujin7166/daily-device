import 'server-only';

import type { HeroSummaryItem } from '@entities/product/model/types';

import prisma from 'prisma/prismaClientSingleton';

export async function getHeroList(
  type: string,
  category?: string,
): Promise<HeroSummaryItem[]> {
  return prisma.hero.findMany({
    where: {
      heroType: { name: type },
      ...(category
        ? {
            OR: [
              { targetCategory: { slug: category } },
              { targetCategoryId: null, name_en: category },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name_en: true,
      name_ko: true,
      description: true,
      detailed_description: true,
      position: true,
      image_url: true,
      textTone: true,
      navTone: true,
      overlayTone: true,
    },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  });
}
