import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { ProductImageItem } from '@entities/product/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getProductImageListBySlug } from './service';

const getProductImagesParamsSchema = z.object({
  slug: z.string().trim().min(1),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      getProductImagesParamsSchema,
      {
        slug: decodeURIComponent(routeParams.slug),
      },
      API_MESSAGE.BAD_REQUEST,
    );
    const productImages = await getProductImageListBySlug(parsedParams.slug);
    const response: ApiResponse<ProductImageItem[]> = {
      items: productImages,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/products/:slug/images] failed:',
    });
  }
}
