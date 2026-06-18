import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { ProductReviewFeedbackSummary } from '@entities/review/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import type { ApiResponse } from '@shared/types/api';

import { upsertProductReviewFeedbackByUser } from './service';

type Data = ApiResponse<ProductReviewFeedbackSummary>;

const upsertProductReviewFeedbackBodySchema = z.object({
  productReviewId: z.coerce.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const payload = parseWithSchema(
      upsertProductReviewFeedbackBodySchema,
      body,
    );
    const item = await upsertProductReviewFeedbackByUser(
      userId,
      payload.productReviewId,
    );
    const response: Data = { items: item, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'upsert-product-review-feedback error:',
    });
  }
}
