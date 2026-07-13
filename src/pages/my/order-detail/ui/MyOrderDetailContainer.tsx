'use client';

import { IconChevronLeft, IconShoppingBagX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { MyPageShell, MyPageMobileMenuButton } from '@features/my/ui';
import { MyPageOrderDetailSkeleton } from '@features/my/ui/skeletons';

import { useCancelOrder } from '@entities/order/queries/useCancelOrder';
import { useHideOrder } from '@entities/order/queries/useHideOrder';
import { useOrders } from '@entities/order/queries/useOrders';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import { useRouter } from '@shared/lib/i18n/navigation';
import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

import MyOrderDetailContent from './MyOrderDetailContent';

type MyOrderDetailContainerProps = {
  orderNumber: string;
};

export default function MyOrderDetailContainer({
  orderNumber,
}: MyOrderDetailContainerProps) {
  const t = useTranslations('MyOrderDetail');
  const router = useRouter();
  const { data: orders, isPending } = useOrders();
  const hideOrderMutation = useHideOrder();
  const cancelOrderMutation = useCancelOrder();

  const order = orders?.find((item) => item.orderNumber === orderNumber);
  const pageClassName = 'w-full lg:pl-4';
  const stateCardClassName =
    'rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-7 dark:border-dark-border dark:bg-dark-bg';
  const totalPrice = order
    ? order.orderItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      )
    : 0;
  const canDeleteOrder = order?.status === 'DELIVERED';
  const canCancelOrder = order?.status === 'CONFIRMED';

  const handleDeleteOrder = async () => {
    if (!orderNumber || hideOrderMutation.isPending) {
      return;
    }

    if (!order || order.status !== 'DELIVERED') {
      toast.error(t('toast.deleteOnlyDelivered'));
      return;
    }

    const shouldDelete = window.confirm(t('toast.deleteConfirm'));
    if (!shouldDelete) {
      return;
    }

    try {
      await hideOrderMutation.mutateAsync(orderNumber);
      toast.success(t('toast.deleteSuccess'));
      router.push(MY_TAB_PATHS.orders);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('toast.deleteFailed');
      toast.error(errorMessage);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderNumber || cancelOrderMutation.isPending) {
      return;
    }

    if (!order || order.status !== 'CONFIRMED') {
      toast.error(t('toast.cancelOnlyConfirmed'));
      return;
    }

    const shouldCancel = window.confirm(t('toast.cancelConfirm'));
    if (!shouldCancel) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync(orderNumber);
      toast.success(t('toast.cancelSuccess'));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('toast.cancelFailed');
      toast.error(errorMessage);
    }
  };

  if (isPending) {
    return (
      <MyPageShell activeTab="orders">
        <MyPageOrderDetailSkeleton
          pageClassName={pageClassName}
          menuButton={<MyPageMobileMenuButton />}
        />
      </MyPageShell>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <MyPageShell activeTab="orders">
        <div className={pageClassName}>
          <div className="mb-4 flex justify-end">
            <MyPageMobileMenuButton />
          </div>
          <div className={stateCardClassName}>
            <div className="flex min-h-105 flex-col items-center justify-center rounded-2xl bg-surface px-6 text-center dark:bg-dark-bg">
              <IconShoppingBagX
                className="text-muted dark:text-dark-muted"
                size={42}
              />
              <h2 className="mt-4 text-xl font-semibold text-ink dark:text-surface">
                {t('state.emptyTitle')}
              </h2>
              <p className="mt-2 text-sm text-muted dark:text-dark-muted">
                {t('state.emptyDescription')}
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
              >
                {t('state.startShopping')}
              </Link>
            </div>
          </div>
        </div>
      </MyPageShell>
    );
  }

  if (!order) {
    return (
      <MyPageShell activeTab="orders">
        <div className={pageClassName}>
          <div className="mb-4 flex justify-end">
            <MyPageMobileMenuButton />
          </div>
          <div className={stateCardClassName}>
            <div className="rounded-2xl border border-line bg-surface p-6 dark:border-dark-border dark:bg-dark-bg">
              <p className="text-sm font-medium text-muted dark:text-dark-muted">
                {t('state.notFound')}
              </p>
              <Link
                href={MY_TAB_PATHS.orders}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover"
              >
                <IconChevronLeft size={16} />
                {t('state.backToOrders')}
              </Link>
            </div>
          </div>
        </div>
      </MyPageShell>
    );
  }

  return (
    <MyPageShell activeTab="orders">
      <MyOrderDetailContent
        order={order}
        totalPrice={totalPrice}
        canDeleteOrder={canDeleteOrder}
        canCancelOrder={canCancelOrder}
        isDeletePending={hideOrderMutation.isPending}
        isCancelPending={cancelOrderMutation.isPending}
        onDeleteOrder={handleDeleteOrder}
        onCancelOrder={handleCancelOrder}
      />
    </MyPageShell>
  );
}
