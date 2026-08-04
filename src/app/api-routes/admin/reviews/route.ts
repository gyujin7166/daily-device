import { NextResponse } from 'next/server';

import { adminReviewQuerySchema } from '@features/admin-review/model/schema';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';

import {
  assertAdminReadAccess,
  getAdminReviewSummary,
  getAdminReviews,
} from '../service';

export async function GET(request: Request) {
  try {
    await assertAdminReadAccess();
    const url = new URL(request.url);
    const query = parseWithSchema(adminReviewQuerySchema, {
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      keyword: url.searchParams.get('keyword'),
      status: url.searchParams.get('status'),
    });
    const [reviews, summary] = await Promise.all([
      getAdminReviews(query),
      getAdminReviewSummary(),
    ]);

    return NextResponse.json(
      { items: { reviews, summary }, message: API_MESSAGE.SUCCESS },
      { status: 200 },
    );
  } catch (error) {
    return handleRouteError(error, {
      logMessage: '[GET /api/admin/reviews] failed:',
    });
  }
}
