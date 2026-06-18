import { NextResponse } from 'next/server';

import { z } from 'zod';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import type { ApiResponse } from '@shared/types/api';

import { getAddresses, upsertAddressForUser } from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const normalizeBoolean = (value: unknown) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

const upsertUserAddressBodySchema = z.object({
  id: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  recipientName: z.string().trim().min(1),
  recipientPhone: z.string().trim().min(1),
  address1: z.string().trim().min(1),
  address2: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  isDefault: z.preprocess(normalizeBoolean, z.boolean().optional()),
});

type GetData = ApiResponse<Awaited<ReturnType<typeof getAddresses>>>;
type PostData = ApiResponse<{ id: number }>;

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    const addresses = await getAddresses(userId);
    const response: GetData = {
      items: addresses,
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      fallbackResponse: {
        items: [],
        message: API_MESSAGE.INTERNAL_SERVER_ERROR,
      },
      getHttpErrorResponse: (error) => ({ items: [], message: error.message }),
      logMessage: 'get-addresses error:',
    });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const payload = parseWithSchema(upsertUserAddressBodySchema, body);
    const result = await upsertAddressForUser(userId, payload);
    const response: PostData = {
      items: { id: result.id },
      message: API_MESSAGE.SUCCESS,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'upsert-address error:',
    });
  }
}
