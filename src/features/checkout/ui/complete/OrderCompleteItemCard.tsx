import Image from 'next/image';

import { useFormatter, useTranslations } from 'next-intl';

import type { OrderItem } from '@entities/order/model/types';

import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

type OrderCompleteItemCardProps = {
  item: OrderItem;
  isLast: boolean;
};

export default function OrderCompleteItemCard({
  item,
  isLast,
}: OrderCompleteItemCardProps) {
  const format = useFormatter();
  const t = useTranslations('Checkout.complete');

  return (
    <div
      className={cn(
        'flex gap-6',
        !isLast ? 'border-b border-line dark:border-dark-border pb-6' : '',
      )}
    >
      <div className="shrink-0">
        <div className="h-28 w-28 overflow-hidden rounded-2xl bg-canvas sm:h-36 sm:w-36 dark:bg-dark-bg-hover">
          <Image
            src={getCloudinaryImageUrl(
              item.product?.ProductImage?.[0]?.image_url || '',
              'orderThumbnail',
            )}
            alt={item.productName}
            width={0}
            height={0}
            sizes="(max-width: 640px) 112px, 144px"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-lg font-semibold text-ink dark:text-surface">
            {item.productName}
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted dark:text-dark-muted">
            <span className="font-medium">
              {t('currency', { amount: format.number(item.price) })}
            </span>
            <span>×</span>
            <span className="rounded-sm bg-canvas px-2 py-1 text-xs font-medium text-ink dark:bg-dark-bg-hover dark:text-surface">
              {t('quantity', { count: item.quantity })}
            </span>
          </div>
        </div>
        <div className="mt-4 text-xl font-bold text-ink dark:text-surface">
          {t('currency', {
            amount: format.number(item.price * item.quantity),
          })}
        </div>
      </div>
    </div>
  );
}
