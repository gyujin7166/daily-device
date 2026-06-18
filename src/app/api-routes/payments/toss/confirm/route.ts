import { NextResponse } from 'next/server';

import { z } from 'zod';

import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { InternalServerError } from '@shared/lib/errors/httpError';

import { confirmTossPaymentForUser } from './service';

const tossConfirmBodySchema = z.object({
  paymentKey: z.string().trim().min(1),
  orderId: z.string().trim().min(1),
  amount: z.coerce.number(),
});

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const {
      paymentKey,
      orderId,
      amount: amountValue,
    } = parseWithSchema(tossConfirmBodySchema, body);

    const secretKey = process.env.TOSS_SECRET_KEY;
    if (!secretKey) {
      throw new InternalServerError('Missing TOSS_SECRET_KEY');
    }

    const result = await confirmTossPaymentForUser({
      userId,
      paymentKey,
      orderId,
      amountValue,
      secretKey,
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return handleRouteError(error, {
      fallbackMessage: 'Toss confirm failed',
      logMessage: 'toss confirm error:',
    });
  }
}
