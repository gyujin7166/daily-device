import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { deleteAddressWithFallback } from './service';

const deleteAddressParamsSchema = z.object({
  addressId: z.coerce.number().int().positive(),
});

type Data = ApiResponse<Awaited<ReturnType<typeof deleteAddressWithFallback>>>;

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ addressId: string }> },
) {
  try {
    const userId = await getRequiredUserId();
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      deleteAddressParamsSchema,
      routeParams,
      'Invalid addressId',
    );

    const result = await deleteAddressWithFallback(
      userId,
      parsedParams.addressId,
    );
    const response: Data = { items: result, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'delete-address error:',
    });
  }
}
