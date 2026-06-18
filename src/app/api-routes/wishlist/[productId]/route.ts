import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { deleteWishlistItemByProduct } from './service';

import type { Prisma } from '@prisma/client';

const deleteWishlistParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
});

type Data = ApiResponse<Prisma.BatchPayload>;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const userId = await getRequiredUserId();
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      deleteWishlistParamsSchema,
      routeParams,
      'Invalid productId',
    );

    await deleteWishlistItemByProduct(userId, parsedParams.productId);
    const response: Data = { message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during delete-wishlist',
    });
  }
}
