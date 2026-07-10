import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { FilterWithOptions } from '@entities/product/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getFilterList } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getFilterQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  locale: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getFilterQuerySchema,
      {
        category: url.searchParams.get('category'),
        locale: url.searchParams.get('locale'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const filter = await getFilterList(query.category ?? '', query.locale);
    const response: ApiResponse<FilterWithOptions[]> = {
      items: filter,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/filters] failed:',
    });
  }
}
