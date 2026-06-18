import 'server-only';

import { OrderStatus } from '@prisma/client';

import prisma from 'prisma/prismaClientSingleton';

const ORDER_PENDING_TTL_MS = 30 * 60 * 1000;

export async function expirePendingOrders(now = new Date()) {
  const expiresBefore = new Date(now.getTime() - ORDER_PENDING_TTL_MS);

  return prisma.order.updateMany({
    where: {
      status: OrderStatus.PENDING,
      createdAt: {
        lt: expiresBefore,
      },
    },
    data: {
      status: OrderStatus.EXPIRED,
    },
  });
}
