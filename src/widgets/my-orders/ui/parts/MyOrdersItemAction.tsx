import Link from 'next/link';

import {
  buildReviewWriteHref,
  myOrdersActionButtonClassName,
  myOrdersReviewEditButtonClassName,
} from '@features/my/model/orderDisplay';
import type { MyOrdersMode } from '@features/my/model/orderList';

import type { OrderResponse } from '@entities/order/model/types';
import type { OrderItem } from '@entities/order/model/types';

type MyOrdersItemActionProps = {
  mode: MyOrdersMode;
  order: OrderResponse;
  item: OrderItem;
  orderDetailHref: string;
};

export default function MyOrdersItemAction({
  mode,
  order,
  item,
  orderDetailHref,
}: MyOrdersItemActionProps) {
  const reviewHref = buildReviewWriteHref(order, item);
  const reviewHiddenNotice = item.reviewAdminHiddenAt ? (
    <span className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-line bg-canvas px-4 text-base font-semibold text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted sm:w-auto">
      상품평 비공개
    </span>
  ) : null;

  if (mode === 'review') {
    return (
      <Link href={reviewHref} className={myOrdersActionButtonClassName}>
        상품평 작성
      </Link>
    );
  }

  if (mode === 'review-written') {
    if (reviewHiddenNotice) {
      return reviewHiddenNotice;
    }

    return (
      <Link href={reviewHref} className={myOrdersReviewEditButtonClassName}>
        상품평 수정
      </Link>
    );
  }

  if (order.status === 'DELIVERED') {
    if (reviewHiddenNotice) {
      return reviewHiddenNotice;
    }

    return (
      <Link
        href={reviewHref}
        className={
          item.reviewWritten
            ? myOrdersReviewEditButtonClassName
            : myOrdersActionButtonClassName
        }
      >
        {item.reviewWritten ? '상품평 수정' : '상품평 작성'}
      </Link>
    );
  }

  if (order.status === 'SHIPPED') {
    return (
      <Link href={orderDetailHref} className={myOrdersActionButtonClassName}>
        배송 조회
      </Link>
    );
  }

  return null;
}
