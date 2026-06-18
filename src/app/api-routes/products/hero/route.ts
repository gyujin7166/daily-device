import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { HeroSummaryItem } from '@entities/product/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getHeroList } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getHeroQuerySchema = z.object({
  type: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  category: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getHeroQuerySchema,
      {
        type: url.searchParams.get('type'),
        category: url.searchParams.get('category'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const hero = await getHeroList(query.type ?? '', query.category ?? '');
    const response: ApiResponse<HeroSummaryItem[]> = {
      items: hero,
      message: API_MESSAGE.SUCCESS,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/hero] failed:',
    });
  }
}
