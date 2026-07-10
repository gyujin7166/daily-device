import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { CatalogProductItem } from '@entities/product/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getProductsPage } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const productSortOptions = [
  'name_asc',
  'name_desc',
  'price_asc',
  'price_desc',
  'relevance',
] as const;

const getProductsQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  sort: z.preprocess(emptyToUndefined, z.enum(productSortOptions).optional()),
  filters: z.preprocess(emptyToUndefined, z.string().optional()),
  colors: z.preprocess(emptyToUndefined, z.string().optional()),
  discounted: z.preprocess(emptyToUndefined, z.string().optional()),
  locale: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  minPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().nonnegative().optional(),
  ),
  maxPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().nonnegative().optional(),
  ),
});

type Data = ApiResponse<
  CatalogProductItem[],
  {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  }
>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getProductsQuerySchema,
      {
        category: url.searchParams.get('category'),
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
        sort: url.searchParams.get('sort'),
        filters: url.searchParams.get('filters'),
        colors: url.searchParams.get('colors'),
        discounted: url.searchParams.get('discounted'),
        locale: url.searchParams.get('locale'),
        minPrice: url.searchParams.get('minPrice'),
        maxPrice: url.searchParams.get('maxPrice'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const sortOption = query.sort ?? 'relevance';
    const filters = (query.filters ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const colorIds = (query.colors ?? '')
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);
    const discountedOnly = query.discounted === 'true';
    const normalizedMinPrice =
      typeof query.minPrice === 'number' &&
      typeof query.maxPrice === 'number' &&
      query.minPrice > query.maxPrice
        ? query.maxPrice
        : query.minPrice;
    const normalizedMaxPrice =
      typeof query.minPrice === 'number' &&
      typeof query.maxPrice === 'number' &&
      query.minPrice > query.maxPrice
        ? query.minPrice
        : query.maxPrice;
    const usePagination =
      typeof query.page === 'number' &&
      query.page > 0 &&
      typeof query.limit === 'number' &&
      query.limit > 0;

    const result = await getProductsPage(
      query.category,
      usePagination ? query.page : undefined,
      usePagination ? query.limit : undefined,
      sortOption,
      filters,
      {
        minPrice: normalizedMinPrice,
        maxPrice: normalizedMaxPrice,
      },
      {
        colorIds,
      },
      {
        discountedOnly,
      },
      query.locale,
    );

    const response: Data = {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products] failed:',
    });
  }
}
