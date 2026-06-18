'use client';
import useMyOrdersContentState from '@features/my/model/hooks/useMyOrdersContentState';
import {
  formatOrderPlacedDate,
  getMyOrdersStatusBadgeClass,
  getMyOrdersStatusText,
  getOrderRecipientName,
  getOrderTotal,
  myOrdersActionButtonClassName,
} from '@features/my/model/orderDisplay';
import type { MyOrdersMode } from '@features/my/model/orderList';
import {
  MyPageMobileMenuButton,
  MyPageScrollArea,
  MyPageSectionHeader,
} from '@features/my/ui';
import MyPageOrdersSkeleton from '@features/my/ui/skeletons/MyPageOrdersSkeleton';

import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import MyOrdersEmptyState from './parts/MyOrdersEmptyState';
import MyOrdersItemAction from './parts/MyOrdersItemAction';
import MyOrdersOrderCard from './parts/MyOrdersOrderCard';
import MyOrdersPagination from './parts/MyOrdersPagination';

export type MyOrdersContentProps = {
  embedded?: boolean;
  mode?: MyOrdersMode;
};

export default function MyOrdersContent({
  embedded = false,
  mode = 'all',
}: MyOrdersContentProps) {
  const {
    confirmingOrderNumber,
    currentPage,
    displayOrders,
    handleConfirmDelivery,
    handlePageChange,
    isFetching,
    isPending,
    isReviewMode,
    isReviewWriteMode,
    isReviewWrittenMode,
    listTopRef,
    pageMeta,
    pageNumbers,
    totalItems,
    totalPages,
  } = useMyOrdersContentState({ mode });
  const pageClassName = embedded
    ? 'w-full rounded-2xl lg:pl-4'
    : 'mx-auto w-full max-w-7xl px-4 pb-16 pt-27.5 sm:px-6';

  if (isPending) {
    return (
      <MyPageOrdersSkeleton
        pageClassName={pageClassName}
        pageLabel={pageMeta.pageLabel}
        pageTitle={pageMeta.pageTitle}
        pageDescription={pageMeta.pageDescription}
        menuButton={embedded ? <MyPageMobileMenuButton /> : undefined}
      />
    );
  }

  if (totalItems === 0) {
    return (
      <div className={pageClassName}>
        <MyPageSectionHeader
          label={pageMeta.pageLabel}
          title={pageMeta.pageTitle}
          description={pageMeta.pageDescription}
        />
        <MyOrdersEmptyState
          isReviewWriteMode={isReviewWriteMode}
          isReviewWrittenMode={isReviewWrittenMode}
        />
      </div>
    );
  }

  return (
    <div className={pageClassName}>
      <MyPageSectionHeader
        label={pageMeta.pageLabel}
        title={pageMeta.pageTitle}
        description={pageMeta.pageDescription}
      />

      <MyPageScrollArea ref={listTopRef} className="scroll-mt-28">
        <div
          className={cn(
            'space-y-3 transition-opacity duration-200',
            isFetching
              ? 'pointer-events-none select-none opacity-60'
              : 'opacity-100',
          )}
          aria-busy={isFetching}
        >
          {displayOrders.map((order) => {
            const orderDetailHref = `/my/orders/${order.orderNumber}`;
            const isConfirmableOrder =
              !isReviewMode && order.status === 'CONFIRMED';

            return (
              <MyOrdersOrderCard
                key={order.id}
                order={order}
                orderDetailHref={orderDetailHref}
                statusBadgeClassName={getMyOrdersStatusBadgeClass(order.status)}
                statusText={getMyOrdersStatusText(order.status)}
                orderPlacedDateText={formatOrderPlacedDate(order.createdAt)}
                orderTotal={getOrderTotal(order)}
                recipientName={getOrderRecipientName(order)}
                isConfirmableOrder={isConfirmableOrder}
                isConfirmDeliveryDisabled={
                  confirmingOrderNumber === order.orderNumber || isFetching
                }
                actionButtonClassName={myOrdersActionButtonClassName}
                onConfirmDelivery={handleConfirmDelivery}
                getOrderItemAction={(item) => (
                  <MyOrdersItemAction
                    mode={mode}
                    order={order}
                    item={item}
                    orderDetailHref={orderDetailHref}
                  />
                )}
              />
            );
          })}
        </div>
        {isFetching ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <Spinner size="md" />
            <span className="sr-only">주문 목록 불러오는 중</span>
          </div>
        ) : null}
      </MyPageScrollArea>

      <MyOrdersPagination
        totalPages={totalPages}
        currentPage={currentPage}
        pageNumbers={pageNumbers}
        isFetching={isFetching}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
