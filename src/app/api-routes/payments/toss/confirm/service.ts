import 'server-only';

import { OrderStatus } from '@prisma/client';

import { expirePendingOrders } from '@app/api-routes/orders/expirePendingOrders';

import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@shared/lib/errors/httpError';
import type { ApiResponse } from '@shared/types/api';

import prisma from 'prisma/prismaClientSingleton';

import type { Prisma } from '@prisma/client';

type TossConfirmResult = {
  status: number;
  body: ApiResponse<unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonRecord = async (
  response: Response,
): Promise<Record<string, unknown>> => {
  const data: unknown = await response.json();
  return isRecord(data) ? data : {};
};

const getStringValue = (data: Record<string, unknown>, key: string) => {
  const value = data[key];
  return typeof value === 'string' ? value : undefined;
};

const toJsonPayload = (data: Record<string, unknown>): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(data));

const buildPaymentData = (
  data: Record<string, unknown>,
  paymentKey: string,
  calculatedAmount: number,
) => ({
  provider: 'TOSS',
  paymentKey: getStringValue(data, 'paymentKey') ?? paymentKey,
  orderName: getStringValue(data, 'orderName') ?? null,
  method: getStringValue(data, 'method') ?? null,
  status: getStringValue(data, 'status') ?? null,
  totalAmount:
    typeof data.totalAmount === 'number' ? data.totalAmount : calculatedAmount,
  requestedAt:
    typeof data.requestedAt === 'string' ? new Date(data.requestedAt) : null,
  approvedAt:
    typeof data.approvedAt === 'string' ? new Date(data.approvedAt) : null,
  rawPayload: toJsonPayload(data),
});

export async function confirmTossPaymentForUser({
  userId,
  paymentKey,
  orderId,
  amountValue,
  secretKey,
}: {
  userId: string;
  paymentKey: string;
  orderId: string;
  amountValue: number;
  secretKey: string;
}): Promise<TossConfirmResult> {
  await expirePendingOrders();

  const order = await prisma.order.findFirst({
    where: { orderNumber: orderId },
    include: { orderItems: true, payment: true },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.userId !== userId) {
    throw new ForbiddenError();
  }

  if (order.status === OrderStatus.CONFIRMED) {
    return { status: 200, body: { message: 'Order already confirmed' } };
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new ConflictError('Invalid order status');
  }

  const isBuyNowOrder =
    Boolean(order.isBuyNow) || order.orderNumber.startsWith('BN-');

  const calculatedAmount = order.orderItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  if (amountValue !== calculatedAmount) {
    throw new BadRequestError('Amount mismatch');
  }

  const encryptedSecretKey = Buffer.from(`${secretKey}:`).toString('base64');
  const tossResponse = await fetch(
    'https://api.tosspayments.com/v1/payments/confirm',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: calculatedAmount,
      }),
    },
  );

  const data = await parseJsonRecord(tossResponse);

  if (!tossResponse.ok) {
    const upstreamMessage =
      typeof data.message === 'string' ? data.message : 'Toss confirm failed';
    return {
      status: tossResponse.status,
      body: { items: data, message: upstreamMessage },
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CONFIRMED },
    });

    await tx.orderPayment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        ...buildPaymentData(data, paymentKey, calculatedAmount),
      },
      update: buildPaymentData(data, paymentKey, calculatedAmount),
    });

    if (!isBuyNowOrder) {
      const cart = await tx.cart.findFirst({
        where: { userId: order.userId },
        select: { id: true },
      });

      if (cart) {
        const orderedCartItemConditions = Array.from(
          new Map(
            order.orderItems.map((item) => [
              `${item.productId}:${item.productColorId ?? 'null'}`,
              {
                productId: item.productId,
                productColorId: item.productColorId ?? null,
              },
            ]),
          ).values(),
        );

        if (orderedCartItemConditions.length > 0) {
          await tx.cartItem.deleteMany({
            where: {
              cartId: cart.id,
              OR: orderedCartItemConditions,
            },
          });
        }
      }
    }
  });

  return {
    status: 200,
    body: { items: data, message: 'Payment confirmed' },
  };
}
