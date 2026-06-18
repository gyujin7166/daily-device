import { NextResponse } from 'next/server';

import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

import type { OrderListItem, OrdersMode } from '@entities/order/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { BadRequestError } from '@shared/lib/errors/httpError';
import type { ApiResponse } from '@shared/types/api';

import {
  assertUserAddressOwnership,
  createOrderForUser,
  getOrdersResultByMode,
} from './service';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const getOrdersQuerySchema = z.object({
  mode: z.preprocess(
    emptyToUndefined,
    z.enum(['all', 'review', 'review-written']).optional(),
  ),
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});

const createOrderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  productColorId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  quantity: z.coerce.number().int().positive(),
});

const shippingSchema = z.object({
  recipientName: z.string().trim().min(1),
  recipientPhone: z.string().trim().min(1),
  address1: z.string().trim().min(1),
  address2: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

const createOrderBodySchema = z.object({
  items: z.array(createOrderItemSchema).min(1),
  isBuyNow: z.boolean().optional(),
  userAddressId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  shipping: shippingSchema.optional(),
  deliveryDate: z.string().nullable().optional(),
  status: z.enum(OrderStatus).optional(),
});

type GetData = ApiResponse<
  OrderListItem[],
  {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  }
>;
type CreateOrderPayload = Parameters<typeof createOrderForUser>[0];
type PostData = ApiResponse<Awaited<ReturnType<typeof createOrderForUser>>>;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsedQuery = parseWithSchema(
      getOrdersQuerySchema,
      {
        mode: url.searchParams.get('mode'),
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
      },
      API_MESSAGE.BAD_REQUEST,
    );

    const mode: OrdersMode = parsedQuery.mode ?? 'all';
    const page = parsedQuery.page;
    const limit = parsedQuery.limit;
    const userId = await getRequiredUserId();
    const result = await getOrdersResultByMode(userId, mode, page, limit);
    const response: GetData = { ...result, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      fallbackResponse: {
        items: [],
        message: API_MESSAGE.INTERNAL_SERVER_ERROR,
      },
      getHttpErrorResponse: (error) => ({ items: [], message: error.message }),
      logMessage: '[GET /api/orders] failed:',
    });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const payload = parseWithSchema(createOrderBodySchema, body);

    if (!payload.userAddressId && !payload.shipping) {
      throw new BadRequestError('Shipping information is required');
    }

    if (payload.userAddressId) {
      await assertUserAddressOwnership(userId, payload.userAddressId);
    }

    const params: CreateOrderPayload = {
      userId,
      items: payload.items.map((it) => ({
        productId: it.productId,
        productColorId: it.productColorId,
        quantity: it.quantity,
      })),
      userAddressId: payload.userAddressId,
      shipping: payload.shipping
        ? {
            recipientName: payload.shipping.recipientName,
            recipientPhone: payload.shipping.recipientPhone,
            address1: payload.shipping.address1,
            address2: payload.shipping.address2,
          }
        : undefined,
      deliveryDate: payload.deliveryDate ?? null,
      status: payload.status ?? OrderStatus.CONFIRMED,
      isBuyNow: Boolean(payload.isBuyNow),
    };

    const result = await createOrderForUser(params);
    const response: PostData = { items: result, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'create-order error:',
    });
  }
}
