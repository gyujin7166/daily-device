import { useFormatter, useLocale, useTranslations } from 'next-intl';

import type { OrderResponse } from '@entities/order/model/types';

import { Link } from '@shared/lib/i18n/navigation';
import { formatDate } from '@shared/lib/utils/formatDate';
import { cn } from '@shared/lib/utils/style';

import type { OrderStatus } from '@prisma/client';

type MyOverviewRecentOrderCardProps = {
  latestOrder: OrderResponse | null;
  ordersHref: string;
};

const getStatusBadgeClass = (status: OrderStatus) => {
  if (status === 'SHIPPED') {
    return 'border border-warning/35 bg-warning-soft text-amber-700 dark:border-warning/50 dark:bg-dark-panel dark:text-amber-300';
  }
  if (status === 'CONFIRMED') {
    return 'border border-success/35 bg-success-soft text-success';
  }
  if (status === 'DELIVERED') {
    return 'border border-primary/25 bg-primary-soft text-primary dark:border-primary/40 dark:bg-dark-panel dark:text-primary';
  }
  if (status === 'CANCELLED') {
    return 'border border-danger/25 bg-danger/5 text-danger dark:translate-y-[1.5px] dark:border-danger/50 dark:bg-dark-panel dark:text-danger';
  }
  return 'border border-line bg-surface text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted';
};

export default function MyOverviewRecentOrderCard({
  latestOrder,
  ordersHref,
}: MyOverviewRecentOrderCardProps) {
  const format = useFormatter();
  const locale = useLocale();
  const t = useTranslations('MyOverview.recentOrder');
  const tOrderStatus = useTranslations('MyOrders.status');

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-xs dark:border-dark-border dark:bg-dark-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink dark:text-surface">
          {t('title')}
        </h2>
        <Link
          href={ordersHref}
          scroll={false}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t('viewOrders')}
        </Link>
      </div>
      {latestOrder ? (
        <div className="rounded-xl border border-line bg-canvas px-4 py-4 dark:border-dark-border dark:bg-dark-bg-hover">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted dark:text-dark-muted">
              {t('orderNumber')}{' '}
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
              {tOrderStatus(latestOrder.status)}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted dark:text-dark-muted">
            {t('orderDate', {
              date: formatDate(latestOrder.createdAt, locale),
            })}
          </p>
          <p className="mt-2 text-sm text-ink dark:text-surface">
            {t('product', {
              name: latestOrder.orderItems[0]?.productName ?? '-',
            })}
            {latestOrder.orderItems.length > 1
              ? t('extraItems', {
                  count: latestOrder.orderItems.length - 1,
                })
              : ''}
          </p>
          <p className="mt-2 text-lg font-semibold text-ink dark:text-surface">
            {t('total', {
              amount: format.number(
                latestOrder.orderItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0,
                ),
              ),
            })}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-canvas px-4 py-4 text-sm text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
          {t('empty')}
        </p>
      )}
    </section>
  );
}
