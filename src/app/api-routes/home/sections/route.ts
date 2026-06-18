import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { HomeSection } from '@entities/home/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getHomeSections } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getHomeSectionsQuerySchema = z.object({
  keys: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getHomeSectionsQuerySchema,
      {
        keys: url.searchParams.get('keys'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const keys = query.keys
      ?.split(',')
      .map((key) => key.trim())
      .filter(Boolean);
    const sections = await getHomeSections({ keys });
    const response: ApiResponse<HomeSection[]> = {
      items: sections,
      message: API_MESSAGE.SUCCESS,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/home/sections] failed:',
    });
  }
}
