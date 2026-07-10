import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { CategoryItems } from '@entities/category/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getCategoryList } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getCategoryQuerySchema = z.object({
  locale: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getCategoryQuerySchema,
      {
        locale: url.searchParams.get('locale'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const category = await getCategoryList(query.locale);
    const response: ApiResponse<CategoryItems[]> = {
      items: category,
      message: API_MESSAGE.SUCCESS,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/categories] failed:',
    });
  }
}
