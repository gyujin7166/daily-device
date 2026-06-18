import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getSearchSuggestionsByKeyword } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getSearchSuggestionsQuerySchema = z.object({
  keyword: z.preprocess(emptyToUndefined, z.string().optional()),
});

type Data = ApiResponse<
  Awaited<ReturnType<typeof getSearchSuggestionsByKeyword>>
>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseWithSchema(
      getSearchSuggestionsQuerySchema,
      {
        keyword: url.searchParams.get('keyword'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const keyword = query.keyword ?? '';
    const searchSuggestions = await getSearchSuggestionsByKeyword(keyword);
    const response: Data = {
      items: searchSuggestions,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/search/suggestions] failed:',
    });
  }
}
