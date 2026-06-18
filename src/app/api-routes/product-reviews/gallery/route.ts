import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { auth } from 'auth';

import { getProductReviewGalleryBySlug } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getProductReviewGalleryQuerySchema = z.object({
  slug: z.string().trim().min(1),
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
  ProductReviewGalleryImage[],
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
    const {
      slug,
      page: normalizedPage,
      limit: normalizedLimit,
    } = parseWithSchema(
      getProductReviewGalleryQuerySchema,
      {
        slug: url.searchParams.get('slug') ?? url.searchParams.get('name_en'),
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
      },
      'slug query parameter is required',
    );
    const usePagination =
      typeof normalizedPage === 'number' && typeof normalizedLimit === 'number';

    const session = await auth();
    const result = await getProductReviewGalleryBySlug(
      slug,
      usePagination ? normalizedPage : undefined,
      usePagination ? normalizedLimit : undefined,
      session?.user?.id ?? undefined,
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
    return handleRouteError(error);
  }
}
