import 'server-only';

import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductFilterMap,
  CatalogProductItem,
} from '@entities/product/model/types';

import {
  getTranslationContext,
  pickTranslation,
} from '@shared/lib/i18n/translation';
import { getProductPriceInfo } from '@shared/lib/price/discount';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

type ProductPageResponse = {
  items: CatalogProductItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

type ProductPriceRangeQuery = {
  minPrice?: number;
  maxPrice?: number;
};

type ProductColorFilterQuery = {
  colorIds?: number[];
};

type ProductDiscountQuery = {
  discountedOnly?: boolean;
};

const getNormalizedProductFilters = (filters: string[]) =>
  Array.from(new Set(filters.map((value) => value.trim()).filter(Boolean)));

const getProductOrderBy = (
  sort: ProductSortOption,
): Prisma.ProductOrderByWithRelationInput[] => {
  if (sort === 'name_asc') {
    return [{ name_ko: 'asc' }, { name_en: 'asc' }, { id: 'asc' }];
  }

  if (sort === 'name_desc') {
    return [{ name_ko: 'desc' }, { name_en: 'desc' }, { id: 'asc' }];
  }

  return [
    { productColor: { _count: 'desc' } },
    { name_ko: 'asc' },
    { name_en: 'asc' },
    { id: 'asc' },
  ];
};

const findProductFilterConditions = async (
  category: string | undefined,
  filters: string[],
): Promise<Prisma.ProductWhereInput[]> => {
  const normalizedFilters = getNormalizedProductFilters(filters);

  if (normalizedFilters.length === 0) {
    return [];
  }

  const filterOptionIdsFromQuery = normalizedFilters
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
  const filterOptions = await prisma.filterOption.findMany({
    where: {
      ...(category ? { categoryName: category } : {}),
      OR: [
        { name_en: { in: normalizedFilters } },
        ...(filterOptionIdsFromQuery.length > 0
          ? [{ id: { in: filterOptionIdsFromQuery } }]
          : []),
      ],
    },
    select: {
      id: true,
      filterId: true,
    },
  });
  const groupedFilterOptionIds = filterOptions.reduce<Record<number, number[]>>(
    (acc, option) => {
      if (!acc[option.filterId]) {
        acc[option.filterId] = [];
      }
      acc[option.filterId].push(option.id);
      return acc;
    },
    {},
  );

  return Object.values(groupedFilterOptionIds).map((optionIds) => ({
    productFilterOption: {
      some: {
        filterOptionId: { in: optionIds },
      },
    },
  }));
};

export async function getProductsPage(
  category?: string,
  page?: number,
  limit?: number,
  sort: ProductSortOption = 'relevance',
  filters: string[] = [],
  priceRange: ProductPriceRangeQuery = {},
  colorFilter: ProductColorFilterQuery = {},
  discountQuery: ProductDiscountQuery = {},
  localeValue?: string,
): Promise<ProductPageResponse> {
  const { locale, localeFallbacks } = getTranslationContext(localeValue);
  const groupedFilterConditions = await findProductFilterConditions(
    category,
    filters,
  );
  const where: Prisma.ProductWhereInput = {
    ...(category ? { category: { slug: category } } : {}),
    ...(typeof priceRange.minPrice === 'number' ||
    typeof priceRange.maxPrice === 'number'
      ? {
          price: {
            ...(typeof priceRange.minPrice === 'number'
              ? { gte: priceRange.minPrice }
              : {}),
            ...(typeof priceRange.maxPrice === 'number'
              ? { lte: priceRange.maxPrice }
              : {}),
          },
        }
      : {}),
    ...(colorFilter.colorIds && colorFilter.colorIds.length > 0
      ? {
          productColor: {
            some: {
              colorId: {
                in: colorFilter.colorIds,
              },
            },
          },
        }
      : {}),
    ...(discountQuery.discountedOnly
      ? {
          discountRate: {
            gt: 0,
          },
        }
      : {}),
    ...(groupedFilterConditions.length > 0
      ? { AND: groupedFilterConditions }
      : {}),
  };
  const shouldSortByDiscountedPrice =
    sort === 'price_asc' || sort === 'price_desc';
  const orderBy = getProductOrderBy(
    shouldSortByDiscountedPrice ? 'name_asc' : sort,
  );
  const skip =
    page && limit ? Math.max(page - 1, 0) * Math.max(limit, 1) : undefined;
  const take = page && limit ? Math.max(limit, 1) : undefined;

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      ...(typeof skip === 'number' && !shouldSortByDiscountedPrice
        ? { skip }
        : {}),
      ...(typeof take === 'number' && !shouldSortByDiscountedPrice
        ? { take }
        : {}),
      orderBy,
      select: {
        id: true,
        productLine: true,
        name_ko: true,
        name_en: true,
        slug: true,
        description: true,
        price: true,
        discountRate: true,
        translations: {
          where: { locale: { in: localeFallbacks } },
          select: {
            locale: true,
            name: true,
            description: true,
          },
        },
        category: {
          select: {
            id: true,
            name_en: true,
            name_ko: true,
            slug: true,
            parentId: true,
            displayOrder: true,
            image_url: true,
            isVisible: true,
            translations: {
              where: { locale: { in: localeFallbacks } },
              select: {
                locale: true,
                name: true,
              },
            },
          },
        },
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
        },
        productFilterOption: {
          select: {
            filterOptionId: true,
            filterOption: {
              select: {
                id: true,
                filterId: true,
                name_en: true,
                name_ko: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const sortedProducts = shouldSortByDiscountedPrice
    ? [...products].sort((firstProduct, secondProduct) => {
        const firstPrice = Number(firstProduct.price);
        const secondPrice = Number(secondProduct.price);
        const firstDiscountedPrice = getProductPriceInfo(
          Number.isFinite(firstPrice) ? firstPrice : 0,
          firstProduct.discountRate,
        ).price;
        const secondDiscountedPrice = getProductPriceInfo(
          Number.isFinite(secondPrice) ? secondPrice : 0,
          secondProduct.discountRate,
        ).price;
        const priceDiff =
          sort === 'price_asc'
            ? firstDiscountedPrice - secondDiscountedPrice
            : secondDiscountedPrice - firstDiscountedPrice;

        if (priceDiff !== 0) {
          return priceDiff;
        }

        const koreanNameDiff = (firstProduct.name_ko ?? '').localeCompare(
          secondProduct.name_ko ?? '',
          'ko',
        );

        if (koreanNameDiff !== 0) {
          return koreanNameDiff;
        }

        const englishNameDiff = firstProduct.name_en.localeCompare(
          secondProduct.name_en,
          'en',
        );

        if (englishNameDiff !== 0) {
          return englishNameDiff;
        }

        return firstProduct.id - secondProduct.id;
      })
    : products;
  const paginatedProducts = shouldSortByDiscountedPrice
    ? sortedProducts.slice(
        typeof skip === 'number' ? skip : 0,
        typeof skip === 'number' && typeof take === 'number'
          ? skip + take
          : undefined,
      )
    : sortedProducts;

  const result: CatalogProductItem[] = paginatedProducts.map((product) => {
    const {
      id,
      name_en,
      slug,
      description,
      productLine,
      price: rawPrice,
      discountRate,
      category: productCategory,
      ProductImage,
      productColor,
    } = product;
    const translation = pickTranslation(product.translations, locale);
    const categoryTranslation = pickTranslation(
      productCategory.translations,
      locale,
    );
    const parsedPrice = Number(rawPrice);
    const priceInfo = getProductPriceInfo(
      Number.isFinite(parsedPrice) ? parsedPrice : 0,
      discountRate,
      locale,
    );
    const filterData: CatalogProductFilterMap = {};

    product.productFilterOption.forEach((filterOption) => {
      const propertyKey = filterOption.filterOption.filterId.toString();

      if (!filterData[propertyKey]) {
        filterData[propertyKey] = [];
      }

      filterData[propertyKey].push(filterOption.filterOptionId);
    });

    return {
      id,
      name_en: translation?.name ?? name_en,
      slug,
      description: translation?.description ?? description,
      productLine,
      ...priceInfo,
      category: {
        id: productCategory.id,
        name_en: categoryTranslation?.name ?? productCategory.name_en,
        name_ko: productCategory.name_ko,
        slug: productCategory.slug,
        parentId: productCategory.parentId,
        displayOrder: productCategory.displayOrder,
        image_url: productCategory.image_url,
        isVisible: productCategory.isVisible,
      },
      filter: [filterData],
      ProductImage,
      productColor: productColor.map((item) => {
        const colorTranslation = pickTranslation(
          item.color.translations,
          locale,
        );

        return {
          id: item.id,
          isDefault: item.isDefault,
          color: {
            name: colorTranslation?.name ?? item.color.name,
            hex: item.color.hex,
          },
        };
      }),
    };
  });

  const safePage = page && page > 0 ? page : 1;
  const safeLimit = limit && limit > 0 ? limit : result.length;
  const hasMore = safePage * safeLimit < total;

  return {
    items: result,
    total,
    page: safePage,
    limit: safeLimit,
    hasMore,
  };
}
