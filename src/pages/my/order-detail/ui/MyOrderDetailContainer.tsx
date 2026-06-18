'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { IconChevronLeft, IconShoppingBagX } from '@tabler/icons-react';

import { MyPageShell, MyPageMobileMenuButton } from '@features/my/ui';
import { MyPageOrderDetailSkeleton } from '@features/my/ui/skeletons';

import { useCancelOrder } from '@entities/order/queries/useCancelOrder';
import { useHideOrder } from '@entities/order/queries/useHideOrder';
import { useOrders } from '@entities/order/queries/useOrders';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import { toast } from '@shared/lib/toast';

import MyOrderDetailContent from './MyOrderDetailContent';

type MyOrderDetailContainerProps = {
  orderNumber: string;
};

export default function MyOrderDetailContainer({
  orderNumber,
}: MyOrderDetailContainerProps) {
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
      toast.error('배송완료 상태에서만 주문 삭제가 가능합니다.');
      return;
    }

    const shouldDelete = window.confirm('이 주문을 목록에서 삭제하시겠습니까?');
    if (!shouldDelete) {
      return;
    }

    try {
      await hideOrderMutation.mutateAsync(orderNumber);
      toast.success('주문이 삭제되었습니다.');
      router.push(MY_TAB_PATHS.orders);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '주문 삭제에 실패했습니다.';
      toast.error(errorMessage);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderNumber || cancelOrderMutation.isPending) {
      return;
    }

    if (!order || order.status !== 'CONFIRMED') {
      toast.error('결제완료 상태에서만 주문취소가 가능합니다.');
      return;
    }

    const shouldCancel = window.confirm('이 주문을 취소하시겠습니까?');
    if (!shouldCancel) {
      return;
    }

    try {
      await cancelOrderMutation.mutateAsync(orderNumber);
      toast.success('주문이 취소되었습니다.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '주문취소에 실패했습니다.';
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
                주문 내역이 없습니다
              </h2>
              <p className="mt-2 text-sm text-muted dark:text-dark-muted">
                아직 주문하신 상품이 없습니다.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover"
              >
                쇼핑 시작하기
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
                주문 정보를 찾을 수 없습니다.
              </p>
              <Link
                href={MY_TAB_PATHS.orders}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover"
              >
                <IconChevronLeft size={16} />
                주문 목록으로
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
