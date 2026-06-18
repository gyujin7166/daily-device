import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { ProductReviewEditItem } from '@entities/review/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { getProductReviewByOrderItem } from './service';

const getProductReviewParamsSchema = z.object({
  orderItemId: z.coerce.number().int().positive(),
});

type Data = ApiResponse<ProductReviewEditItem | null>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderItemId: string }> },
) {
  try {
    const userId = await getRequiredUserId();
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      getProductReviewParamsSchema,
      routeParams,
      'Invalid orderItemId',
    );

    const productReview = await getProductReviewByOrderItem(
      userId,
      parsedParams.orderItemId,
    );
    const response: Data = {
      items: productReview,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during get-product-review:',
    });
  }
}
