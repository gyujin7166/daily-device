import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { ProductDetailResponse } from '@entities/product/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getProductDetailBySlug } from './service';

const getProductDetailParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getProductDetailQuerySchema = z.object({
  locale: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const url = new URL(request.url);
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      getProductDetailParamsSchema,
      {
        slug: decodeURIComponent(routeParams.slug),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const query = parseWithSchema(
      getProductDetailQuerySchema,
      {
        locale: url.searchParams.get('locale'),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const productDetail = await getProductDetailBySlug(
      parsedParams.slug,
      query.locale,
    );
    const response: ApiResponse<ProductDetailResponse> = {
      items: productDetail,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/:slug] failed:',
    });
  }
}
