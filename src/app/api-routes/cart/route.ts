import { NextResponse } from 'next/server';

import { z } from 'zod';

import type { CartResponse } from '@entities/cart/model/types';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import type { ApiResponse } from '@shared/types/api';

import { deleteCartItems, getCartByUserId, upsertCartItem } from './service';

import type { Prisma } from '@prisma/client';

const emptyToUndefined = (value: unknown) =>
  value === '' || value === null ? undefined : value;

const upsertCartBodySchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int(),
  productColorId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  colorName: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).optional(),
  ),
});

const deleteCartBodySchema = z.object({
  cartItemId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  productId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  productColorId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  colorName: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).optional(),
  ),
});

type GetData = ApiResponse<CartResponse>;
type PostData = ApiResponse<CartResponse>;
type DeleteData = ApiResponse<Prisma.BatchPayload>;

export async function GET() {
  try {
    const userId = await getRequiredUserId();
    const cart = await getCartByUserId(userId);
    const response: GetData = { items: cart, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during get-cart:',
    });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const { productId, quantity, productColorId, colorName } = parseWithSchema(
      upsertCartBodySchema,
      body,
    );

    await upsertCartItem({
      userId,
      productId,
      quantity,
      productColorId,
      colorName,
    });
    const cart = await getCartByUserId(userId);

    const response: PostData = { items: cart, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during upsert-cart',
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await getRequiredUserId();
    const body = await readJsonBody(request);
    const parsedBody = parseWithSchema(deleteCartBodySchema, body);
    const { cartItemId, productId, productColorId, colorName } = parsedBody;

    const cart = await deleteCartItems({
      userId,
      cartItemId,
      productId,
      productColorId,
      colorName,
    });
    const response: DeleteData = { items: cart, message: API_MESSAGE.SUCCESS };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleRouteError(error, {
      logMessage: 'An error occurred during delete-cart',
    });
  }
}
