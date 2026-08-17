'use client';
import { useFormatter, useTranslations } from 'next-intl';

import useMyOrdersContentState from '@features/my/model/hooks/useMyOrdersContentState';
import {
  getMyOrdersStatusBadgeClass,
  getOrderRecipientName,
  getOrderTotal,
  myOrdersActionButtonClassName,
} from '@features/my/model/orderDisplay';
import type { MyOrdersMode } from '@features/my/model/orderList';
import {
  MyPageLoadingOverlay,
  MyPageMobileMenuButton,
  MyPageScrollArea,
  MyPageSectionHeader,
} from '@features/my/ui';
import MyPageOrdersSkeleton from '@features/my/ui/skeletons/MyPageOrdersSkeleton';

import { cn } from '@shared/lib/utils/style';

import MyOrdersEmptyState from './parts/MyOrdersEmptyState';
import MyOrdersItemAction from './parts/MyOrdersItemAction';
import MyOrdersOrderCard from './parts/MyOrdersOrderCard';
import MyOrdersPagination from './parts/MyOrdersPagination';

export type MyOrdersContentProps = {
  mode?: MyOrdersMode;
};

export default function MyOrdersContent({
  mode = 'all',
}: MyOrdersContentProps) {
  const t = useTranslations('MyOrders');
  const format = useFormatter();
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
    pageNumbers,
    totalItems,
    totalPages,
  } = useMyOrdersContentState({ mode });
  const pageClassName = 'w-full rounded-2xl lg:pl-4';
  const pageMeta = isReviewWriteMode
    ? {
        pageLabel: t('meta.reviewWrite.label'),
        pageTitle: t('meta.reviewWrite.title'),
        pageDescription: t('meta.reviewWrite.description'),
      }
    : isReviewWrittenMode
      ? {
          pageLabel: t('meta.reviewWritten.label'),
          pageTitle: t('meta.reviewWritten.title'),
          pageDescription: t('meta.reviewWritten.description'),
        }
      : {
          pageLabel: t('meta.all.label'),
          pageTitle: t('meta.all.title'),
          pageDescription: t('meta.all.description'),
        };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return format.dateTime(date, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  if (isPending) {
    return (
      <MyPageOrdersSkeleton
        pageClassName={pageClassName}
        pageLabel={pageMeta.pageLabel}
        pageTitle={pageMeta.pageTitle}
        pageDescription={pageMeta.pageDescription}
        menuButton={<MyPageMobileMenuButton />}
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
                statusText={t(`status.${order.status}`)}
                orderPlacedDateText={formatDate(order.createdAt)}
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
          <MyPageLoadingOverlay label={t('loading')} hideDuringTabTransition />
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
