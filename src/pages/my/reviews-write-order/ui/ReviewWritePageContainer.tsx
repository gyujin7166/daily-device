'use client';
import Image from 'next/image';

import { MyReviewWriteSkeleton } from '@features/my/ui/skeletons';
import { ReviewForm } from '@features/product-review/ui';

import { useOrders } from '@entities/order/queries/useOrders';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';
import type { ProductReviewEditItem } from '@entities/review/model/types';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { formatDate } from '@shared/lib/utils/formatDate';
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
    return <div>주문 정보를 불러오지 못했습니다.</div>;
  }

  if (!orderItem) {
    return <div>해당 상품의 주문 정보를 찾을 수 없습니다.</div>;
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
    ? '상품평 비공개'
    : productReview
      ? '상품평 수정'
      : '상품평 작성';

  return (
    <PageWrapper size="form" className="mt-22.5 max-w-2xl pb-12 pt-5 sm:pt-6">
      <div className="mx-auto max-w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink dark:text-surface">
            {pageTitle}
          </h1>
          {isReviewAdminHidden ? (
            <p className="mt-1.5 text-sm text-danger">
              이 상품평은 관리자 검토로 비공개 처리되어 수정할 수 없습니다.
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-muted dark:text-dark-muted">
              주문번호{' '}
              <span className="font-semibold text-primary dark:text-blue-300">
                #{orderNumber}
              </span>
              에 대한 상품평을 작성해 주세요.
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
                    금액
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {totalPrice.toLocaleString()}원
                    <span className="ml-1 text-disabled-text dark:text-dark-muted">
                      (개당 {unitPrice.toLocaleString()}원)
                    </span>
                  </dd>
                </div>

                {orderItem.colorName ? (
                  <div className="flex items-baseline gap-2">
                    <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                      색상
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
                    수량
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {orderItem.quantity}개
                  </dd>
                </div>

                <div className="flex items-baseline gap-2">
                  <dt className="w-12 shrink-0 text-sm text-muted dark:text-dark-muted">
                    배송일
                  </dt>
                  <dd className="text-sm font-medium text-ink dark:text-surface">
                    {formatDate(order.deliveryDate)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      {isReviewAdminHidden ? (
        <div className="rounded-2xl border border-danger/25 bg-red-50 p-6 text-sm leading-6 text-danger dark:bg-red-950/30">
          비공개 처리된 상품평은 상품 상세 페이지에 노출되지 않으며, 작성자가
          수정하거나 다시 작성할 수 없습니다. 필요하면 고객센터에 문의해 주세요.
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
