import { useFormatter, useTranslations } from 'next-intl';

import type { OrderResponse } from '@entities/order/model/types';

import { cn } from '@shared/lib/utils/style';

import MyOrderDetailHeaderSection from './MyOrderDetailHeaderSection';
import MyOrderDetailOrderItemsSection from './MyOrderDetailOrderItemsSection';
import MyOrderDetailShippingSection from './MyOrderDetailShippingSection';
import MyOrderDetailSummaryFooter from './MyOrderDetailSummaryFooter';

import type { OrderStatus } from '@prisma/client';

type MyOrderDetailContentProps = {
  order: OrderResponse;
  totalPrice: number;
  canDeleteOrder: boolean;
  canCancelOrder: boolean;
  isDeletePending: boolean;
  isCancelPending: boolean;
  onDeleteOrder: () => void;
  onCancelOrder: () => void;
};

const getStatusBadgeClass = (status: OrderStatus) => {
  if (status === 'CONFIRMED') {
    return 'border border-success/35 bg-success-soft text-success';
  }
  if (status === 'SHIPPED') {
    return 'border border-warning/35 bg-warning-soft text-amber-700 dark:border-warning/50 dark:bg-dark-panel dark:text-amber-300';
  }
  if (status === 'DELIVERED') {
    return 'border border-primary/25 bg-primary-soft text-primary dark:border-primary/40 dark:bg-dark-panel dark:text-primary';
  }
  if (status === 'CANCELLED') {
    return 'border border-danger/25 bg-danger/5 text-danger dark:translate-y-[1.5px] dark:border-danger/50 dark:bg-dark-panel dark:text-danger';
  }
  return 'border border-line bg-surface text-muted dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted';
};

export default function MyOrderDetailContent({
  order,
  totalPrice,
  canDeleteOrder,
  canCancelOrder,
  isDeletePending,
  isCancelPending,
  onDeleteOrder,
  onCancelOrder,
}: MyOrderDetailContentProps) {
  const t = useTranslations('MyOrderDetail');
  const format = useFormatter();
  const statusBadgeClassName = getStatusBadgeClass(order.status);
  const statusText = t(`status.${order.status}`);
  const orderCreatedAt = new Date(order.createdAt);
  const orderCreatedAtText = Number.isNaN(orderCreatedAt.getTime())
    ? '-'
    : format.dateTime(orderCreatedAt, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });

  return (
    <section className="w-full lg:pl-4">
      <MyOrderDetailHeaderSection
        canDeleteOrder={canDeleteOrder}
        canCancelOrder={canCancelOrder}
        isDeletePending={isDeletePending}
        isCancelPending={isCancelPending}
        onDeleteOrder={onDeleteOrder}
        onCancelOrder={onCancelOrder}
      />

      <article className="overflow-hidden rounded-3xl border-4 border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-bg">
        <header className="border-b border-line bg-canvas/40 px-5 py-5 sm:px-7 dark:border-dark-border dark:bg-dark-bg-hover">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-2 text-sm text-muted dark:text-dark-muted">
              <span className="font-semibold text-ink dark:text-surface">
                {t('labels.orderNumber')}
              </span>
              <span className="truncate font-semibold text-primary dark:text-blue-300">
                #{order.orderNumber}
              </span>
            </div>
            <span
              className={cn(
                'inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold leading-none',
                statusBadgeClassName,
              )}
            >
              {statusText}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            {orderCreatedAtText}
          </p>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <MyOrderDetailShippingSection shipping={order.orderShipping} />
          <MyOrderDetailOrderItemsSection orderItems={order.orderItems} />
        </div>

        <MyOrderDetailSummaryFooter
          totalPrice={totalPrice}
          deliveryDate={order.deliveryDate}
        />
      </article>
    </section>
  );
}
