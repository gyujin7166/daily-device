import 'server-only';

import type {
  SearchResultItem,
  SearchSortOption,
} from '@features/search/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';
import { getProductPriceInfo } from '@shared/lib/price/discount';
import { escapeRegExp } from '@shared/lib/utils/escapeRegExp';
import { normalizeSearchTerm } from '@shared/lib/utils/normalizeSearchText';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

type SearchResultPageResponse = {
  items: SearchResultItem[];
  total: number;
  baseTotal: number;
  page: number;
  limit: number;
  hasMore: boolean;
  availableCategories: string[];
};

const getOrderBy = (
  sort: SearchSortOption,
): Prisma.ProductOrderByWithRelationInput => {
  switch (sort) {
    case 'name_asc':
      return { name_en: 'asc' };
    case 'name_desc':
      return { name_en: 'desc' };
    case 'price_asc':
      return { price: 'asc' };
    case 'price_desc':
      return { price: 'desc' };
    case 'relevance':
    default:
      return { id: 'desc' };
  }
};

const normalizeComparableText = (value: string | null | undefined) =>
  normalizeSearchTerm(value ?? '');

const getMatchRank = (value: string | null | undefined, keyword: string) => {
  const normalizedValue = normalizeComparableText(value);

  if (!normalizedValue || !keyword) {
    return 0;
  }

  if (normalizedValue === keyword) {
    return 100;
  }

  if (normalizedValue.startsWith(keyword)) {
    return 70;
  }

  if (normalizedValue.includes(keyword)) {
    return 40;
  }

  return 0;
};

export async function getSearchResultPage({
  keyword,
  page,
  limit,
  categories,
  sort,
  locale: localeValue,
}: {
  keyword: string;
  page: number;
  limit: number;
  categories: string[];
  sort: SearchSortOption;
  locale?: string;
}): Promise<SearchResultPageResponse> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);

  if (!keyword.trim()) {
    return {
      items: [],
      total: 0,
      baseTotal: 0,
      page,
      limit,
      hasMore: false,
      availableCategories: [],
    };
  }

  const relevanceKeyword = normalizeSearchTerm(keyword);
  const normalizedKeyword = escapeRegExp(relevanceKeyword);
  const keywordWhere: Prisma.ProductWhereInput = {
    OR: [
      { name_en: { contains: normalizedKeyword } },
      { name_ko: { contains: normalizedKeyword } },
      { search_keyword: { contains: normalizedKeyword } },
    ],
  };

  const where: Prisma.ProductWhereInput = {
    ...keywordWhere,
    ...(categories.length
      ? {
          category: {
            slug: {
              in: categories,
            },
          },
        }
      : {}),
  };

  const skip = Math.max(page - 1, 0) * limit;
  const shouldSortByRelevance = sort === 'relevance';
  const [baseTotal, total, searchResult, availableCategoryRows] =
    await Promise.all([
      prisma.product.count({
        where: keywordWhere,
      }),
      prisma.product.count({
        where,
      }),
      prisma.product.findMany({
        where,
        select: {
          id: true,
          productLine: true,
          name_en: true,
          slug: true,
          name_ko: true,
          search_keyword: true,
          translations: {
            where: { locale: { in: localeFallbacks } },
            select: {
              locale: true,
              name: true,
              description: true,
            },
          },
          price: true,
          discountRate: true,
          ProductImage: {
            where: {
              OR: [
                { isMain: true },
                { order: 1 },
                { productColorId: { not: null } },
              ],
            },
            select: {
              image_url: true,
              isMain: true,
              productColorId: true,
              order: true,
            },
            orderBy: [
              { productColorId: 'asc' },
              { isMain: 'desc' },
              { order: 'asc' },
              { id: 'asc' },
            ],
          },
          productColor: {
            orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
            select: {
              id: true,
              isDefault: true,
              color: {
                select: {
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
          },
          description: true,
          category: {
            select: {
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
          },
        },
        orderBy: getOrderBy(sort),
        ...(shouldSortByRelevance ? {} : { skip, take: limit }),
      }),
      prisma.product.findMany({
        where: keywordWhere,
        select: {
          category: {
            select: {
              slug: true,
            },
          },
        },
        distinct: ['categoryId'],
      }),
    ]);

  const availableCategories = Array.from(
    new Set(availableCategoryRows.map((item) => item.category.slug)),
  ).sort((a, b) => a.localeCompare(b));

  const sortedSearchResult = shouldSortByRelevance
    ? [...searchResult]
        .sort((firstProduct, secondProduct) => {
          const getRelevanceScore = (product: (typeof searchResult)[number]) =>
            Math.max(
              getMatchRank(product.name_ko, relevanceKeyword),
              getMatchRank(product.name_en, relevanceKeyword),
            ) *
              10 +
            Math.max(
              getMatchRank(product.category.name_ko, relevanceKeyword),
              getMatchRank(product.category.name_en, relevanceKeyword),
              getMatchRank(product.category.slug, relevanceKeyword),
            ) *
              9 +
            getMatchRank(product.search_keyword, relevanceKeyword);

          const scoreDiff =
            getRelevanceScore(secondProduct) - getRelevanceScore(firstProduct);

          if (scoreDiff !== 0) {
            return scoreDiff;
          }

          const categoryOrderDiff =
            firstProduct.category.displayOrder -
            secondProduct.category.displayOrder;

          if (categoryOrderDiff !== 0) {
            return categoryOrderDiff;
          }

          return firstProduct.id - secondProduct.id;
        })
        .slice(skip, skip + limit)
    : searchResult;

  const items: SearchResultItem[] = sortedSearchResult.map((item) => {
    const parsedPrice = Number(item.price);
    const priceInfo = getProductPriceInfo(
      Number.isFinite(parsedPrice) ? parsedPrice : 0,
      item.discountRate,
      locale,
    );
    const {
      search_keyword: _searchKeyword,
      category,
      translations,
      ...product
    } = item;
    const translation = pickTranslation(translations, locale);
    const categoryTranslation = pickTranslation(category.translations, locale);
    const {
      name_ko: _categoryNameKo,
      displayOrder: _categoryDisplayOrder,
      translations: _categoryTranslations,
      ...publicCategory
    } = category;

    return {
      ...product,
      name_en: translation?.name ?? product.name_en,
      description: translation?.description ?? product.description,
      productColor: product.productColor.map((productColor) => {
        const colorTranslation = pickTranslation(
          productColor.color.translations,
          locale,
        );

        return {
          id: productColor.id,
          isDefault: productColor.isDefault,
          color: {
            name: colorTranslation?.name ?? productColor.color.name,
            hex: productColor.color.hex,
          },
        };
      }),
      category: {
        ...publicCategory,
        name_en: categoryTranslation?.name ?? publicCategory.name_en,
      },
      ...priceInfo,
    };
  });

  return {
    items,
    total,
    baseTotal,
    page,
    limit,
    hasMore: page * limit < total,
    availableCategories,
  };
}
