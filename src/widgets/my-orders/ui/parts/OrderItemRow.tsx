import type { ReactNode } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import type { OrderItem } from '@entities/order/model/types';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getProductHref } from '@shared/lib/routes/productRoutes';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';

type MyOrdersItemRowProps = {
  item: OrderItem;
  itemTotal: number;
  action: ReactNode;
};

const DEFAULT_COLOR_HEX = '#111827';

export default function MyOrdersItemRow({
  item,
  itemTotal,
  action,
}: MyOrdersItemRowProps) {
  const imageUrl =
    getProductThumbnailUrlBySelectedColor(
      item.product.ProductImage,
      item.productColorId,
    ) || IMAGE_FALLBACK_URL;
  const colorHex = item.colorHex || DEFAULT_COLOR_HEX;
  const productHref = getProductHref({
    categorySlug: item.product.category.slug,
    productSlug: item.product.slug,
  });

  return (
    <div className="bg-surface px-5 py-5 sm:px-6 md:py-4 dark:bg-dark-panel">
      <div className="md:hidden">
        <div className="flex min-w-0 items-start gap-3 sm:gap-5 max-[359px]:flex-col">
          <div className="relative h-26 w-26 shrink-0 overflow-hidden rounded-2xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg-hover sm:h-30.5 sm:w-30.5 max-[359px]:h-24 max-[359px]:w-24">
            <Image
              src={getCloudinaryImageUrl(imageUrl, 'orderThumbnail')}
              alt={item.productName}
              fill
              sizes="122px"
              className="object-cover"
            />
          </div>

          <div className="flex min-h-26 min-w-0 flex-1 flex-col justify-between sm:min-h-30.5 max-[359px]:min-h-0 max-[359px]:w-full">
            <h3 className="line-clamp-2 text-lg font-extrabold leading-[1.2] tracking-[-0.01em] sm:text-2xl">
              <Link
                href={productHref}
                className="text-ink transition-colors hover:text-primary dark:text-surface dark:hover:text-blue-300"
              >
                {item.productName}
              </Link>
            </h3>

            <div className="space-y-1.5 text-xs text-muted dark:text-dark-muted sm:text-base">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-6.5 font-medium">색상</span>
                {item.colorName ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-line dark:border-dark-border"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="truncate">{item.colorName}</span>
                  </>
                ) : (
                  <span className="text-muted dark:text-dark-muted">
                    옵션 없음
                  </span>
                )}
              </p>

              <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="min-w-6.5 font-medium">수량</span>
                <span className="inline-flex h-7 items-center rounded-full bg-canvas px-2.5 text-xs font-semibold text-ink dark:bg-dark-bg-hover dark:text-surface">
                  {item.quantity}개
                </span>
              </p>

              <p className="pt-1 text-base font-semibold text-ink dark:text-surface sm:text-lg">
                {itemTotal.toLocaleString('ko-KR')}원
              </p>
            </div>
          </div>
        </div>

        {action ? (
          <div className="mt-4 border-t border-line pt-4 dark:border-dark-border">
            {action}
          </div>
        ) : null}
      </div>

      <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,1.3fr)] items-center gap-4 md:grid">
        <div className="flex w-full min-w-0 items-center justify-start gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg-hover">
            <Image
              src={getCloudinaryImageUrl(imageUrl, 'orderThumbnail')}
              alt={item.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-semibold leading-6 tracking-[-0.01em]">
              <Link
                href={productHref}
                className="text-ink transition-colors hover:text-primary dark:text-surface dark:hover:text-blue-300"
              >
                {item.productName}
              </Link>
            </h3>
          </div>
        </div>

        <div className="flex w-full items-center justify-start gap-2 text-base text-ink dark:text-surface">
          {item.colorName ? (
            <>
              <span
                className="h-3 w-3 rounded-full border border-line dark:border-dark-border"
                style={{ backgroundColor: colorHex }}
              />
              <span className="truncate">{item.colorName}</span>
            </>
          ) : (
            <span className="text-muted dark:text-dark-muted">옵션 없음</span>
          )}
        </div>

        <div className="flex w-full justify-end">
          <span className="text-base font-semibold leading-none tracking-[-0.01em] text-ink dark:text-surface">
            {item.quantity}
          </span>
        </div>

        <div className="flex w-full justify-end">
          <span className="whitespace-nowrap text-base font-semibold leading-none tracking-[-0.01em] tabular-nums text-ink dark:text-surface">
            {itemTotal.toLocaleString('ko-KR')}원
          </span>
        </div>

        <div className="flex w-full justify-end">{action}</div>
      </div>
    </div>
  );
}
