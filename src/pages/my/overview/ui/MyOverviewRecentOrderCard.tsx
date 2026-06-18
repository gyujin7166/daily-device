import Link from 'next/link';

import { ORDER_STATUS } from '@entities/order/model/orderStatus';
import type { OrderResponse } from '@entities/order/model/types';

import { formatDate } from '@shared/lib/utils/formatDate';
import { cn } from '@shared/lib/utils/style';

import type { OrderStatus } from '@prisma/client';

type MyOverviewRecentOrderCardProps = {
  latestOrder: OrderResponse | null;
  ordersHref: string;
};

const getStatusBadgeClass = (status: OrderStatus) => {
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

export default function MyOverviewRecentOrderCard({
  latestOrder,
  ordersHref,
}: MyOverviewRecentOrderCardProps) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-surface">
          최근 주문
        </h2>
        <Link
          href={ordersHref}
          scroll={false}
          className="text-sm font-semibold text-primary hover:underline"
        >
          주문 목록 보기
        </Link>
      </div>
      {latestOrder ? (
        <div className="rounded-xl border border-line bg-canvas px-4 py-4 dark:border-dark-border dark:bg-dark-bg-hover">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted dark:text-dark-muted">
              주문번호{' '}
              <span className="font-semibold text-primary">
                #{latestOrder.orderNumber}
              </span>
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-none',
                getStatusBadgeClass(latestOrder.status),
              )}
            >
              {ORDER_STATUS[latestOrder.status] ?? latestOrder.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            주문일: {formatDate(latestOrder.createdAt)}
          </p>
          <p className="mt-2 text-sm text-ink dark:text-surface">
            상품: {latestOrder.orderItems[0]?.productName ?? '-'}
            {latestOrder.orderItems.length > 1
              ? ` 외 ${latestOrder.orderItems.length - 1}건`
              : ''}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink dark:text-surface">
            총액:{' '}
            {latestOrder.orderItems
              .reduce((sum, item) => sum + item.price * item.quantity, 0)
              .toLocaleString('ko-KR')}
            원
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-canvas px-4 py-4 text-sm text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
          최근 주문 내역이 없습니다.
        </p>
      )}
    </section>
  );
}
