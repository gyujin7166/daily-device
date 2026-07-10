import 'server-only';

import type { HeroSummaryItem } from '@entities/product/model/types';

import {
  DEFAULT_LOCALE,
  getLocaleFallbacks,
  toSupportedLocale,
} from '@shared/lib/i18n/locale';

import prisma from 'prisma/prismaClientSingleton';

export async function getHeroList(
  type: string,
  category?: string,
  localeValue?: string,
): Promise<HeroSummaryItem[]> {
  const locale = toSupportedLocale(localeValue);
  const localeFallbacks = getLocaleFallbacks(locale);
  const heroes = await prisma.hero.findMany({
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
      translations: {
        where: { locale: { in: localeFallbacks } },
        select: {
          locale: true,
          name: true,
          description: true,
          detailed_description: true,
        },
      },
    },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  });

  return heroes.map((hero) => {
    const translation =
      hero.translations.find((item) => item.locale === locale) ??
      hero.translations.find((item) => item.locale === DEFAULT_LOCALE);

    return {
      id: hero.id,
      name_en: translation?.name ?? hero.name_en,
      name_ko: hero.name_ko,
      description: translation?.description ?? hero.description,
      detailed_description:
        translation?.detailed_description ?? hero.detailed_description,
      position: hero.position,
      image_url: hero.image_url,
      textTone: hero.textTone,
      navTone: hero.navTone,
      overlayTone: hero.overlayTone,
    };
  });
}
