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

export const getMyOrdersPageMeta = (
  isReviewWriteMode: boolean,
  isReviewWrittenMode: boolean,
) => {
  if (isReviewWriteMode) {
    return {
      pageLabel: 'WRITE REVIEW',
      pageTitle: '상품평 작성',
      pageDescription:
        '배송 완료된 주문 중 아직 상품평을 작성하지 않은 항목입니다.',
    };
  }

  if (isReviewWrittenMode) {
    return {
      pageLabel: 'REVIEWS',
      pageTitle: '작성한 상품평',
      pageDescription:
        '작성한 상품평을 확인하고, 공개 중인 상품평은 수정할 수 있습니다.',
    };
  }

  return {
    pageLabel: 'ORDERS',
    pageTitle: '주문 목록',
    pageDescription: '최근 주문 내역을 확인하세요.',
  };
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
