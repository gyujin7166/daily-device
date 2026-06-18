import { NextResponse } from 'next/server';

import { z } from 'zod';

import type {
  SearchResultItem,
  SearchSortOption,
} from '@features/search/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getSearchResultPage } from './service';

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 36;

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const parseCategoryFilter = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const searchSortOptions = [
  'relevance',
  'name_asc',
  'name_desc',
  'price_asc',
  'price_desc',
] as const;

const getSearchResultQuerySchema = z.object({
  keyword: z.string().default(''),
  categories: z.preprocess(emptyToUndefined, z.string().optional()),
  sort: z.preprocess(emptyToUndefined, z.enum(searchSortOptions).optional()),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});

type Data = ApiResponse<
  SearchResultItem[],
  {
    total?: number;
    baseTotal?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
    availableCategories?: string[];
  }
>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getSearchResultQuerySchema,
      {
        keyword: url.searchParams.get('keyword') ?? '',
        categories: url.searchParams.get('categories'),
        sort: url.searchParams.get('sort'),
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const keyword = query.keyword.trim();
    const categories = parseCategoryFilter(query.categories ?? '');
    const sort: SearchSortOption = query.sort ?? 'relevance';
    const page = query.page ?? 1;
    const limit = Math.min(
      Math.max(query.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );

    const searchResult = await getSearchResultPage({
      keyword,
      page,
      limit,
      categories,
      sort,
    });

    const response: Data = {
      items: searchResult.items,
      total: searchResult.total,
      baseTotal: searchResult.baseTotal,
      page: searchResult.page,
      limit: searchResult.limit,
      hasMore: searchResult.hasMore,
      availableCategories: searchResult.availableCategories,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/search/results] failed:',
    });
  }
}
