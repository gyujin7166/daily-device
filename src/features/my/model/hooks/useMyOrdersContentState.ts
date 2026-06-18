import { useEffect, useRef, useState } from 'react';

import { useConfirmDelivery } from '@entities/order/queries/useConfirmDelivery';
import { useOrdersPaged } from '@entities/order/queries/useOrdersPaged';

import { toast } from '@shared/lib/toast';

import {
  getMyOrdersPageMeta,
  getMyOrdersPaginationPages,
  getMyOrdersQueryMode,
  MY_ORDERS_PER_PAGE,
} from '../orderList';

import type { MyOrdersMode } from '../orderList';

type UseMyOrdersContentStateParams = {
  mode: MyOrdersMode;
};

export default function useMyOrdersContentState({
  mode,
}: UseMyOrdersContentStateParams) {
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const [confirmingOrderNumber, setConfirmingOrderNumber] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingScrollPage, setPendingScrollPage] = useState<number | null>(
    null,
  );

  const isReviewWriteMode = mode === 'review';
  const isReviewWrittenMode = mode === 'review-written';
  const isReviewMode = isReviewWriteMode || isReviewWrittenMode;
  const queryMode = getMyOrdersQueryMode(mode);
  const pageMeta = getMyOrdersPageMeta(isReviewWriteMode, isReviewWrittenMode);
  const confirmDeliveryMutation = useConfirmDelivery();

  const {
    data: pagedOrders,
    isFetching,
    isPending,
  } = useOrdersPaged({
    mode: queryMode,
    page: currentPage,
    limit: MY_ORDERS_PER_PAGE,
  });
  const displayOrders = pagedOrders?.items ?? [];
  const totalItems = pagedOrders?.total ?? 0;
  const totalPages = Math.max(1, pagedOrders?.totalPages ?? 1);
  const pageNumbers = getMyOrdersPaginationPages(currentPage, totalPages);

  const handleConfirmDelivery = async (orderNumber: string) => {
    if (confirmingOrderNumber) {
      return;
    }

    setConfirmingOrderNumber(orderNumber);
    try {
      await confirmDeliveryMutation.mutateAsync(orderNumber);
      toast.success('수취확인이 완료되었습니다.');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '수취확인에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setConfirmingOrderNumber(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page === currentPage || isFetching) {
      return;
    }

    setPendingScrollPage(page);
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [queryMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (pendingScrollPage === null || isFetching) {
      return;
    }

    if (pagedOrders?.page === pendingScrollPage) {
      const frameId = window.requestAnimationFrame(() => {
        listTopRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });

      setPendingScrollPage(null);

      return () => window.cancelAnimationFrame(frameId);
    }

    if (currentPage === pendingScrollPage) {
      setPendingScrollPage(null);
    }
  }, [currentPage, isFetching, pagedOrders?.page, pendingScrollPage]);

  return {
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
  };
}
