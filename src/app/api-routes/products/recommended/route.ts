import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getRecommendedProductsList } from './service';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 12;

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

type Data = ApiResponse<Awaited<ReturnType<typeof getRecommendedProductsList>>>;

const getRecommendedProductsQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  excludeId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getRecommendedProductsQuerySchema,
      {
        category: url.searchParams.get('category'),
        excludeId: url.searchParams.get('excludeId'),
        limit: url.searchParams.get('limit'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const limit = Math.min(
      Math.max(query.limit ?? DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const items = await getRecommendedProductsList({
      category: query.category,
      excludeId: query.excludeId,
      limit,
    });
    const response: Data = { items, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/recommended] failed:',
    });
  }
}
