import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { deleteCartItemsByRoute } from './service';

import type { Prisma } from '@prisma/client';

const deleteCartParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
});

type Data = ApiResponse<Prisma.BatchPayload>;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cartItemId: string }> },
) {
  try {
    const userId = await getRequiredUserId();
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      deleteCartParamsSchema,
      routeParams,
      'Invalid cartItemId',
    );

    const cart = await deleteCartItemsByRoute({
      userId,
      cartItemId: parsedParams.cartItemId,
    });
    const response: Data = { items: cart, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during delete-cart',
    });
  }
}
