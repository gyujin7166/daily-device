import type { OrderStatus as PrismaOrderStatus } from '@prisma/client';

type OrderStatusKey = PrismaOrderStatus;

type OrderStatusValue =
  | '결제대기'
  | '결제완료'
  | '배송중'
  | '배송완료'
  | '주문취소';

export const ORDER_STATUS: Partial<Record<OrderStatusKey, OrderStatusValue>> = {
  PENDING: '결제대기',
  CONFIRMED: '결제완료',
  SHIPPED: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '주문취소',
};
