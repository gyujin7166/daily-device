import Image from 'next/image';

import { useFormatter, useTranslations } from 'next-intl';

import type { OrderItem } from '@entities/order/model/types';
import { getProductThumbnailUrlBySelectedColor } from '@entities/product/model/productImages';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';
import type { CSSVariableStyle } from '@shared/lib/utils/style';

type MyOrderDetailOrderItemCardProps = {
  item: OrderItem;
  isLastItem: boolean;
};

export default function MyOrderDetailOrderItemCard({
  item,
  isLastItem,
}: MyOrderDetailOrderItemCardProps) {
  const t = useTranslations('MyOrderDetail');
  const format = useFormatter();
  const itemTotal = item.price * item.quantity;
  const formatCurrency = (price: number) =>
    t('format.currency', { amount: format.number(price) });
  const imageUrl =
    getProductThumbnailUrlBySelectedColor(
      item.product.ProductImage,
      item.productColorId,
    ) || IMAGE_FALLBACK_URL;
  const colorStyle: CSSVariableStyle = {
    '--color': item.colorHex || '#111827',
  };

  return (
    <div className={cn(!isLastItem ? 'border-b border-line pb-5' : '')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-26 w-26 shrink-0 overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg-hover">
          <Image
            src={getCloudinaryImageUrl(imageUrl, 'orderThumbnail')}
            alt={item.productName}
            fill
            sizes="104px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 tracking-[-0.01em] text-ink dark:text-surface">
            {item.productName}
          </h3>

          <div className="mt-2 space-y-1.5 text-sm text-muted dark:text-dark-muted">
            {item.colorName ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>{t('labels.color')}</span>
                <span className="inline-flex items-center gap-1.5 text-ink dark:text-surface">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-line bg-(--color) dark:border-dark-border"
                    style={colorStyle}
                  />
                  {item.colorName}
                </span>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                {t('labels.price')}{' '}
                <span className="font-medium text-ink dark:text-surface">
                  {formatCurrency(item.price)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                {t('labels.quantity')}
                <span className="rounded-full bg-line px-2 py-0.5 text-xs font-medium text-ink dark:bg-dark-bg-hover dark:text-surface">
                  {t('format.quantity', { count: format.number(item.quantity) })}
                </span>
              </span>
            </div>
          </div>

          <p className="mt-3 text-base font-semibold leading-none tracking-[-0.01em] text-ink dark:text-surface">
            {formatCurrency(itemTotal)}
          </p>
        </div>
      </div>
    </div>
  );
}
