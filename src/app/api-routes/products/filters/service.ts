import 'server-only';

import type {
  FilterWithOptions,
  ProductColorFilterOption,
} from '@entities/product/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';

import prisma from 'prisma/prismaClientSingleton';

export async function getProductCategoryBySlug(categorySlug: string) {
  return prisma.productCategory.findUnique({
    where: {
      slug: categorySlug,
    },
    select: {
      id: true,
    },
  });
}

export async function getFilterList(
  categoryName: string,
  localeValue?: string,
): Promise<FilterWithOptions[]> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const filters = await prisma.filter.findMany({
    select: {
      id: true,
      name: true,
      categoryName: true,
      translations: {
        where: { locale: { in: localeFallbacks } },
        select: {
          locale: true,
          name: true,
        },
      },
      filterOption: {
        select: {
          id: true,
          filterId: true,
          name_ko: true,
          name_en: true,
          categoryName: true,
          translations: {
            where: { locale: { in: localeFallbacks } },
            select: {
              locale: true,
              name: true,
            },
          },
        },
      },
    },
    where: {
      categoryName,
    },
  });

  return filters.map((filter) => {
    const filterTranslation = pickTranslation(filter.translations, locale);

    return {
      id: filter.id,
      name: filterTranslation?.name ?? filter.name,
      categoryName: filter.categoryName,
      filterOption: filter.filterOption.map((option) => {
        const optionTranslation = pickTranslation(option.translations, locale);

        return {
          id: option.id,
          filterId: option.filterId,
          name_ko: optionTranslation?.name ?? option.name_ko,
          name_en: option.name_en,
          categoryName: option.categoryName,
        };
      }),
    };
  });
}

export async function getProductPriceRange(categorySlug: string) {
  const result = await prisma.product.aggregate({
    where: {
      category: {
        slug: categorySlug,
      },
    },
    _min: {
      price: true,
    },
    _max: {
      price: true,
    },
  });

  return {
    minPrice: Number(result._min.price ?? 0),
    maxPrice: Number(result._max.price ?? 0),
  };
}

export async function getProductColorFilterOptions(
  categorySlug: string,
  localeValue?: string,
): Promise<ProductColorFilterOption[]> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const productColors = await prisma.productColor.findMany({
    where: {
      product: {
        category: {
          slug: categorySlug,
        },
      },
    },
    distinct: ['colorId'],
    orderBy: {
      colorId: 'asc',
    },
    select: {
      colorId: true,
      color: {
        select: {
          id: true,
          name: true,
          hex: true,
          translations: {
            where: { locale: { in: localeFallbacks } },
            select: {
              locale: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return productColors.map(({ color }) => {
    const colorTranslation = pickTranslation(color.translations, locale);

    return {
      id: color.id,
      name: colorTranslation?.name ?? color.name,
      hex: color.hex,
    };
  });
}
