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

export async function hideOrderByNumber(orderNumber: string, userId: string) {
  await expirePendingOrders();

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      status: true,
      userHiddenAt: true,
      userId: true,
    },
  });

  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.userId !== userId) {
    throw new ForbiddenError();
  }

  if (order.userHiddenAt) {
    return { message: 'Already hidden' };
  }

  if (order.status !== OrderStatus.DELIVERED) {
    throw new ConflictError(
      'Order can only be hidden when status is DELIVERED.',
    );
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { userHiddenAt: new Date() },
  });

  return { message: API_MESSAGE.SUCCESS };
}
