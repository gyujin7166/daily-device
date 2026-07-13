import type { OrderResponse } from '@entities/order/model/types';
import type { OrderItem } from '@entities/order/model/types';

import type { OrderStatus } from '@prisma/client';

export const myOrdersActionButtonClassName =
  'inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-surface px-4 text-base font-semibold whitespace-nowrap text-ink transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:border-dark-border dark:bg-dark-panel dark:text-surface';

export const myOrdersReviewEditButtonClassName =
  'inline-flex h-10 w-full items-center justify-center rounded-md border border-primary/25 bg-primary-soft px-4 text-base font-semibold whitespace-nowrap text-primary transition hover:border-primary hover:bg-primary hover:text-surface disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:border-primary/40 dark:bg-primary/15 dark:text-blue-300 dark:hover:bg-primary dark:hover:text-surface';

export const getMyOrdersStatusBadgeClass = (status: OrderStatus) => {
  if (status === 'SHIPPED') {
    return 'border border-warning/35 bg-warning-soft text-warning';
  }

  if (status === 'CONFIRMED') {
    return 'border border-success/35 bg-success-soft text-success';
  }

  if (status === 'DELIVERED') {
    return 'border border-primary/25 bg-primary-soft text-primary';
  }

  if (status === 'CANCELLED') {
    return 'border border-danger/25 bg-danger/5 text-danger dark:border-danger/50 dark:bg-danger/20 dark:text-danger dark:translate-y-[1.5px]';
  }

  return 'border border-line bg-surface text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted';
};

export const buildReviewWriteHref = (order: OrderResponse, item: OrderItem) => {
  const deliveryDate = (order.deliveryDate ?? '').split('T')[0] || '';
  const params = new URLSearchParams({
    productId: `${item.productId}`,
    colorId: `${item.productColorId ?? 'null'}`,
    deliveryDate,
  });

  return `/my/reviews/write/${order.orderNumber}?${params.toString()}`;
};

export const formatOrderPlacedDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
};

export const getOrderTotal = (order: OrderResponse) =>
  order.orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

export const getOrderRecipientName = (order: OrderResponse) =>
  order.orderShipping?.recipientName ?? '-';
