import type { ReactNode } from 'react';

import Link from 'next/link';

import type { OrderResponse } from '@entities/order/model/types';
import type { OrderItem } from '@entities/order/model/types';

import { cn } from '@shared/lib/utils/style';

import MyOrdersItemRow from './OrderItemRow';

type MyOrdersOrderCardProps = {
  order: OrderResponse;
  orderDetailHref: string;
  statusBadgeClassName: string;
  statusText: string;
  orderPlacedDateText: string;
  orderTotal: number;
  recipientName: string;
  isConfirmableOrder: boolean;
  isConfirmDeliveryDisabled: boolean;
  actionButtonClassName: string;
  onConfirmDelivery: (orderNumber: string) => void;
  getOrderItemAction: (item: OrderItem) => ReactNode;
};

export default function MyOrdersOrderCard({
  order,
  orderDetailHref,
  statusBadgeClassName,
  statusText,
  orderPlacedDateText,
  orderTotal,
  recipientName,
  isConfirmableOrder,
  isConfirmDeliveryDisabled,
  actionButtonClassName,
  onConfirmDelivery,
  getOrderItemAction,
}: MyOrdersOrderCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border-2 border-line bg-surface shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <header className="border-b border-line dark:border-dark-border">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <span
                className={cn(
                  'inline-flex h-8 items-center rounded-full px-3 text-sm font-semibold leading-none',
                  statusBadgeClassName,
                )}
              >
                {statusText}
              </span>
              <Link
                href={orderDetailHref}
                className="min-w-0 truncate text-sm font-semibold tracking-[0.02em] text-muted transition-colors hover:text-primary dark:text-dark-muted"
              >
                <span className="text-muted/80 dark:text-dark-muted">
                  주문번호:
                </span>{' '}
                <span className="font-bold text-ink dark:text-surface">
                  {order.orderNumber}
                </span>
              </Link>
            </div>
            <Link
              href={orderDetailHref}
              className="shrink-0 whitespace-nowrap text-sm font-semibold leading-none tracking-[-0.01em] text-primary transition-colors hover:text-primary-hover"
            >
              상세 보기
            </Link>
          </div>
        </div>

        <div className="border-t border-line bg-info-soft px-5 py-3 sm:px-6 dark:border-dark-border dark:bg-dark-bg-hover">
          <div className="grid gap-2 text-base md:grid-cols-[148px_148px_minmax(0,1fr)] md:gap-5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted dark:text-dark-muted">
                주문일
              </span>
              <span className="truncate font-semibold tracking-[-0.01em] text-ink dark:text-surface">
                {orderPlacedDateText}
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted dark:text-dark-muted">
                총액
              </span>
              <span className="truncate font-semibold tracking-[-0.01em] text-ink dark:text-surface">
                {orderTotal.toLocaleString('ko-KR')}원
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm font-semibold uppercase tracking-[0.12em] text-muted dark:text-dark-muted">
                배송지
              </span>
              <span className="truncate font-semibold tracking-[-0.01em] text-ink dark:text-surface">
                {recipientName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="divide-y divide-line dark:divide-dark-border">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] items-center border-b border-line bg-canvas/80 px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-muted dark:border-dark-border dark:bg-dark-bg/70 dark:text-dark-muted md:grid">
          <span className="flex w-full justify-start">상품</span>
          <span className="flex w-full justify-start">색상</span>
          <span className="flex w-full justify-end">수량</span>
          <span className="flex w-full justify-end">금액</span>
          <span className="flex w-full justify-end" aria-hidden="true"></span>
        </div>

        {order.orderItems.map((item) => (
          <MyOrdersItemRow
            key={item.id}
            item={item}
            itemTotal={item.price * item.quantity}
            action={getOrderItemAction(item)}
          />
        ))}
      </div>

      {isConfirmableOrder ? (
        <div className="border-t border-line bg-surface px-5 py-4 sm:px-6 dark:border-dark-border dark:bg-dark-panel">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onConfirmDelivery(order.orderNumber)}
              disabled={isConfirmDeliveryDisabled}
              className={cn(actionButtonClassName, 'sm:min-w-26')}
            >
              수취확인
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
