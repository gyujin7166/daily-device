import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';

import { revalidatePublicShopPages } from '../../revalidation';
import { adminIdParamSchema, adminReviewPatchBodySchema } from '../../schemas';
import {
  assertAdminWriteAccess,
  hideAdminReview,
  restoreAdminReview,
} from '../../service';

type AdminReviewRouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function PATCH(
  request: Request,
  context: AdminReviewRouteContext,
) {
  try {
    await assertAdminWriteAccess();
    const { reviewId } = await context.params;
    const { id } = parseWithSchema(adminIdParamSchema, { id: reviewId });
    const body = await readJsonBody(request);
    const { hidden } = parseWithSchema(adminReviewPatchBodySchema, body);
    const review = hidden
      ? await hideAdminReview(id)
      : await restoreAdminReview(id);
    revalidatePublicShopPages();

    return NextResponse.json(
      { items: review, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[PATCH /api/admin/reviews/:reviewId] failed:',
    });
  }
}
