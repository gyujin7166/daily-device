import 'server-only';

import { OrderStatus } from '@prisma/client';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '@shared/lib/errors/httpError';

import prisma from 'prisma/prismaClientSingleton';

import { expirePendingOrders } from '../../expirePendingOrders';

export async function cancelOrderByNumber(orderNumber: string, userId: string) {
  await expirePendingOrders();

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      status: true,
      userId: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.userId !== userId) {
    throw new ForbiddenError();
  }

  if (order.status === OrderStatus.CANCELLED) {
    return { message: 'Already cancelled' };
  }

  if (order.status !== OrderStatus.CONFIRMED) {
    throw new ConflictError(
      'Order can only be cancelled when status is CONFIRMED.',
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.CANCELLED },
  });

  return { message: API_MESSAGE.SUCCESS };
}
