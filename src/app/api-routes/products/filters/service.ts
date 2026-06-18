import 'server-only';

import type {
  FilterWithOptions,
  ProductColorFilterOption,
} from '@entities/product/model/types';

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
): Promise<FilterWithOptions[]> {
  return prisma.filter.findMany({
    include: {
      filterOption: true,
    },
    where: {
      categoryName,
    },
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
): Promise<ProductColorFilterOption[]> {
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
        },
      },
    },
  });

  return productColors.map(({ color }) => ({
    id: color.id,
    name: color.name,
    hex: color.hex,
  }));
}
