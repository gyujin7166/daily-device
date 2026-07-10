import 'server-only';

import type { HomeSection } from '@entities/home/model/types';

import {
  DEFAULT_LOCALE,
  getLocaleFallbacks,
  toSupportedLocale,
} from '@shared/lib/i18n/locale';
import {
  getCategoryHref,
  getProductHref,
} from '@shared/lib/routes/productRoutes';

import prisma from 'prisma/prismaClientSingleton';

type GetHomeSectionsOptions = {
  keys?: string[];
  locale?: string;
};

export async function getHomeSections({
  keys,
  locale: localeValue,
}: GetHomeSectionsOptions = {}): Promise<HomeSection[]> {
  const locale = toSupportedLocale(localeValue);
  const localeFallbacks = getLocaleFallbacks(locale);
  const sections = await prisma.homeSection.findMany({
    where: {
      isVisible: true,
      ...(keys && keys.length > 0 ? { key: { in: keys } } : {}),
    },
    select: {
      id: true,
      key: true,
      eyebrow: true,
      title: true,
      subtitle: true,
      displayOrder: true,
      translations: {
        where: { locale: { in: localeFallbacks } },
        select: {
          locale: true,
          eyebrow: true,
          title: true,
          subtitle: true,
        },
      },
      items: {
        where: { isVisible: true },
        select: {
          id: true,
          label: true,
          title: true,
          description: true,
          cta: true,
          href: true,
          targetCategory: {
            select: {
              slug: true,
            },
          },
          targetProduct: {
            select: {
              slug: true,
              category: {
                select: {
                  slug: true,
                },
              },
            },
          },
          image_url: true,
          imageAlt: true,
          displayOrder: true,
          layoutGroup: true,
          layoutGroupClassName: true,
          layoutAreaClassName: true,
          labelPosition: true,
          imageClassName: true,
          translations: {
            where: { locale: { in: localeFallbacks } },
            select: {
              locale: true,
              label: true,
              title: true,
              description: true,
              cta: true,
              imageAlt: true,
            },
          },
        },
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      },
    },
    orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
  });

  return sections.map((section) => ({
    id: section.id,
    key: section.key,
    eyebrow:
      section.translations.find((item) => item.locale === locale)?.eyebrow ??
      section.translations.find((item) => item.locale === DEFAULT_LOCALE)
        ?.eyebrow ??
      section.eyebrow,
    title:
      section.translations.find((item) => item.locale === locale)?.title ??
      section.translations.find((item) => item.locale === DEFAULT_LOCALE)
        ?.title ??
      section.title,
    subtitle:
      section.translations.find((item) => item.locale === locale)?.subtitle ??
      section.translations.find((item) => item.locale === DEFAULT_LOCALE)
        ?.subtitle ??
      section.subtitle,
    displayOrder: section.displayOrder,
    items: section.items.map((item) => {
      const translation =
        item.translations.find((entry) => entry.locale === locale) ??
        item.translations.find((entry) => entry.locale === DEFAULT_LOCALE);
      const href =
        item.targetProduct && item.targetProduct.category
          ? getProductHref({
              categorySlug: item.targetProduct.category.slug,
              productSlug: item.targetProduct.slug,
            })
          : item.targetCategory
            ? getCategoryHref(item.targetCategory.slug)
            : item.href;

      return {
        id: item.id,
        label: translation?.label ?? item.label,
        title: translation?.title ?? item.title,
        description: translation?.description ?? item.description,
        cta: translation?.cta ?? item.cta,
        href,
        image_url: item.image_url,
        imageAlt: translation?.imageAlt ?? item.imageAlt,
        displayOrder: item.displayOrder,
        layoutGroup: item.layoutGroup,
        layoutGroupClassName: item.layoutGroupClassName,
        layoutAreaClassName: item.layoutAreaClassName,
        labelPosition: item.labelPosition,
        imageClassName: item.imageClassName,
      };
    }),
  }));
}
