import 'server-only';

import type { CategoryItems } from '@entities/category/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';

import prisma from 'prisma/prismaClientSingleton';

export async function getCategoryList(
  localeValue?: string,
): Promise<CategoryItems[]> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const categories = await prisma.productCategory.findMany({
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
      translations: {
        where: { locale: { in: localeFallbacks } },
        select: {
          locale: true,
          name: true,
        },
      },
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
          translations: {
            where: { locale: { in: localeFallbacks } },
            select: {
              locale: true,
              name: true,
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { name_ko: 'asc' }],
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { name_ko: 'asc' }],
  });

  return categories.map((category) => {
    const categoryTranslation = pickTranslation(category.translations, locale);

    return {
      id: category.id,
      name_en: categoryTranslation?.name ?? category.name_en,
      name_ko: category.name_ko,
      slug: category.slug,
      image_url: category.image_url,
      displayOrder: category.displayOrder,
      children: category.children.map((child) => {
        const childTranslation = pickTranslation(child.translations, locale);

        return {
          id: child.id,
          name_en: childTranslation?.name ?? child.name_en,
          name_ko: child.name_ko,
          slug: child.slug,
          displayOrder: child.displayOrder,
        };
      }),
    };
  });
}
