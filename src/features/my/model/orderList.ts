import type { OrdersMode } from '@entities/order/model/types';

export type MyOrdersMode = 'all' | 'review' | 'review-written';

export const MY_ORDERS_PER_PAGE = 5;

export const getMyOrdersQueryMode = (mode: MyOrdersMode): OrdersMode => {
  if (mode === 'review') {
    return 'review';
  }

  if (mode === 'review-written') {
    return 'review-written';
  }

  return 'all';
};

export const getMyOrdersPaginationPages = (
  currentPage: number,
  totalPages: number,
) => {
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  const adjustedStartPage = Math.max(1, endPage - 4);

  return Array.from(
    { length: endPage - adjustedStartPage + 1 },
    (_, index) => adjustedStartPage + index,
  );
};
