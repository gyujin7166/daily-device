'use client';
import Image from 'next/image';

import { useFormatter, useTranslations } from 'next-intl';

import { MyReviewWriteSkeleton } from '@features/my/ui/skeletons';
import { ReviewForm } from '@features/product-review/ui';

import { useOrders } from '@entities/order/queries/useOrders';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import type { ProductReviewEditItem } from '@entities/review/model/types';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import type { CSSVariableStyle } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ReviewWritePageContainerProps = {
  orderNumber: string;
  productId: number;
  colorId: number | null;
  orderItemId: number;
  productReview: ProductReviewEditItem | null;
  reviewAdminHiddenAt?: string | null;
};

export default function ReviewWritePageContainer({
  orderNumber,
  productId,
  colorId,
  orderItemId,
  productReview,
  reviewAdminHiddenAt = null,
}: ReviewWritePageContainerProps) {
  const t = useTranslations('ReviewWrite');
  const format = useFormatter();
  const { data, isPending } = useOrders();

  const order = data?.find((item) => item.orderNumber === orderNumber);
  const orderItem =
    order?.orderItems.find((item) => item.id === orderItemId) ??
    order?.orderItems.find(
      (item) =>
        item.productId === productId &&
        (colorId === null
          ? item.productColorId === null
          : item.productColorId === colorId),
    );

  if (isPending) {
    return <MyReviewWriteSkeleton />;
  }

  if (!order) {
    return <div>{t('page.orderLoadFailed')}</div>;
  }

  if (!orderItem) {
    return <div>{t('page.orderItemNotFound')}</div>;
  }

  const unitPrice = orderItem.price;
  const totalPrice = unitPrice * orderItem.quantity;
  const productImageUrl =
    getProductThumbnailUrlBySelectedColor(
      orderItem.product.ProductImage,
      orderItem.productColorId,
    ) ?? IMAGE_FALLBACK_URL;
  const colorStyle: CSSVariableStyle = {
    '--color': orderItem.colorHex ?? undefined,
  };
  const isReviewAdminHidden = Boolean(reviewAdminHiddenAt);
  const pageTitle = isReviewAdminHidden
    ? t('page.hiddenTitle')
    : productReview
      ? t('page.editTitle')
      : t('page.writeTitle');
  const formatCurrency = (price: number) =>
    t('format.currency', { amount: format.number(price) });
  const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : null;
  const deliveryDateText =
    deliveryDate && !Number.isNaN(deliveryDate.getTime())
      ? format.dateTime(deliveryDate, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
      : '-';

  return (
    <PageWrapper size="form" className="mt-22.5 max-w-2xl pb-12 pt-5 sm:pt-6">
      <div className="mx-auto max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink dark:text-surface">
            {pageTitle}
          </h1>
          {isReviewAdminHidden ? (
            <p className="mt-1.5 text-sm text-danger">
              {t('page.hiddenDescription')}
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-muted dark:text-dark-muted">
              {t.rich('page.description', {
                orderNumber: `#${orderNumber}`,
                span: (chunks) => (
                  <span className="font-semibold text-primary dark:text-blue-300">
                    {chunks}
                  </span>
                ),
              })}
            </p>
          )}
        </div>

        <div className="mb-4 rounded-2xl border border-line bg-surface p-6 dark:border-dark-border dark:bg-dark-panel">
          <div className="flex items-stretch gap-5">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg">
              <Image
                src={getCloudinaryImageUrl(productImageUrl, 'orderThumbnail')}
                alt={orderItem.productName || ''}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-3 line-clamp-2 text-lg font-bold text-ink dark:text-surface">
                {orderItem.productName}
              </h3>
              <dl className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                    {t('summary.amount')}
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {formatCurrency(totalPrice)}
                    <span className="ml-1 text-disabled-text dark:text-dark-muted">
                      (
                      {t('summary.unitPrice', {
                        price: formatCurrency(unitPrice),
                      })}
                      )
                    </span>
                  </dd>
                </div>

                {orderItem.colorName ? (
                  <div className="flex items-baseline gap-2">
                    <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                      {t('summary.color')}
                    </dt>
                    <dd className="flex items-center gap-2 text-sm font-medium text-ink dark:text-surface">
                      <div
                        className="h-4 w-4 rounded-full border border-ink bg-(--color) shadow-xs"
                        style={colorStyle}
                      />
                      {orderItem.colorName}
                    </dd>
                  </div>
                ) : null}

                <div className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                    {t('summary.quantity')}
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {t('format.quantity', {
                      count: format.number(orderItem.quantity),
                    })}
                  </dd>
                </div>

                <div className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                    {t('summary.deliveryDate')}
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {deliveryDateText}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      {isReviewAdminHidden ? (
        <div className="rounded-2xl border border-danger/25 bg-red-50 p-6 text-sm leading-6 text-danger dark:bg-red-950/30">
          {t('page.hiddenNotice')}
        </div>
      ) : (
        <ReviewForm
          productId={orderItem.productId}
          orderItemId={orderItem.id}
          initialReview={productReview}
        />
      )}
    </PageWrapper>
  );
}
