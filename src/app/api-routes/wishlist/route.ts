import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import type { ApiResponse } from '@shared/types/api';

import { clearWishlist, getWishlistList, upsertWishlistItem } from './service';

import type { Prisma } from '@prisma/client';

const upsertWishlistBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
});

type GetData = ApiResponse<Awaited<ReturnType<typeof getWishlistList>>>;
type PostData = ApiResponse<Awaited<ReturnType<typeof upsertWishlistItem>>>;
type DeleteData = ApiResponse<Prisma.BatchPayload>;

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    const wishlist = await getWishlistList(userId);
    const response: GetData = { items: wishlist, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      fallbackResponse: {
        items: [],
        message: API_MESSAGE.INTERNAL_SERVER_ERROR,
      },
      getHttpErrorResponse: (error) => ({ items: [], message: error.message }),
      logMessage: 'An error occurred during get-wishlist',
    });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const payload = parseWithSchema(upsertWishlistBodySchema, body);
    const result = await upsertWishlistItem(userId, payload.productId);
    const response: PostData = { items: result, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during upsert-wishlist',
    });
  }
}

export async function DELETE() {
  try {
    const userId = await getRequiredUserId();
    await clearWishlist(userId);
    const response: DeleteData = { message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during clear-wishlist',
    });
  }
}
