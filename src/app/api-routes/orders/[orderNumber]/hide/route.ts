import { NextResponse } from 'next/server';

import { z } from 'zod';

import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import type { ApiResponse } from '@shared/types/api';

import { hideOrderByNumber } from './service';

const orderNumberParamsSchema = z.object({
  orderNumber: z.string().trim().min(1),
});

type Data = ApiResponse;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const userId = await getRequiredUserId();
    const routeParams = await params;
    const parsedParams = parseWithSchema(
      orderNumberParamsSchema,
      routeParams,
      'Invalid orderNumber',
    );
    const result = await hideOrderByNumber(parsedParams.orderNumber, userId);
    const response: Data = { message: result.message };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'hide-order error:',
    });
  }
}
