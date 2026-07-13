
import { useTranslations } from 'next-intl';

import {
  buildReviewWriteHref,
  myOrdersActionButtonClassName,
  myOrdersReviewEditButtonClassName,
} from '@features/my/model/orderDisplay';
import type { MyOrdersMode } from '@features/my/model/orderList';

import type { OrderResponse } from '@entities/order/model/types';
import type { OrderItem } from '@entities/order/model/types';

import { Link } from '@shared/lib/i18n/navigation';

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
  const t = useTranslations('MyOrders');
  const reviewHref = buildReviewWriteHref(order, item);
  const reviewHiddenNotice = item.reviewAdminHiddenAt ? (
    <span className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border border-line bg-canvas px-4 text-base font-semibold text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted sm:w-auto">
      {t('actions.hiddenReview')}
    </span>
  ) : null;

  if (mode === 'review') {
    return (
      <Link href={reviewHref} className={myOrdersActionButtonClassName}>
        {t('actions.writeReview')}
      </Link>
    );
  }

  if (mode === 'review-written') {
    if (reviewHiddenNotice) {
      return reviewHiddenNotice;
    }

    return (
      <Link href={reviewHref} className={myOrdersReviewEditButtonClassName}>
        {t('actions.editReview')}
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
        {item.reviewWritten
          ? t('actions.editReview')
          : t('actions.writeReview')}
      </Link>
    );
  }

  if (order.status === 'SHIPPED') {
    return (
      <Link href={orderDetailHref} className={myOrdersActionButtonClassName}>
        {t('actions.trackDelivery')}
      </Link>
    );
  }

  return null;
}
