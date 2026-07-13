import Image from 'next/image';

import { useFormatter, useTranslations } from 'next-intl';

import { useCartContext } from '@entities/cart/model/context/CartContext';
import type { UserCartItem } from '@entities/cart/model/types';

import { Link } from '@shared/lib/i18n/navigation';
import { getOptionalProductHref } from '@shared/lib/routes/productRoutes';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';

type CheckoutOrderItemsProps = {
  items?: UserCartItem[];
};

export default function CheckoutOrderItems({
  items: overrideItems,
}: CheckoutOrderItemsProps) {
  const format = useFormatter();
  const t = useTranslations('Checkout.orderItems');
  const { userCartItems } = useCartContext();
  const items = overrideItems ?? userCartItems;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl">
      <div className="grid gap-5 lg:gap-6">
        {items.map((item) => {
          const productName = item.product.name_en;
          const productSlug = item.product.slug;
          const colorName = item.colorName?.trim();
          const categorySlug =
            item.product.category?.slug ?? item.product.category?.name_en;
          const productHref = getOptionalProductHref({
            categorySlug,
            productSlug,
          });

          return (
            <article
              key={item.id}
              className="flex w-full gap-4 rounded-2xl sm:flex-row sm:items-start"
            >
              <div className="flex h-30 w-30 shrink-0 items-center justify-center rounded-2xl bg-canvas p-4 ring-1 ring-ink/5 sm:h-35 sm:w-35 lg:h-40 lg:w-40 dark:bg-dark-bg-hover dark:ring-dark-border/50">
                <Image
                  src={getCloudinaryImageUrl(
                    item.product.image_url ?? '',
                    'orderThumbnail',
                  )}
                  alt={item.product.name_en}
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-2.5">
                  <div className="min-w-0 self-stretch">
                    {productHref ? (
                      <Link
                        href={productHref}
                        className="block max-w-full break-words text-base font-bold uppercase leading-6 text-ink hover:text-primary lg:text-lg dark:text-surface dark:hover:text-primary"
                      >
                        {productName}
                      </Link>
                    ) : (
                      <h3 className="block max-w-full break-words text-base font-bold uppercase leading-6 lg:text-lg">
                        {productName}
                      </h3>
                    )}
                    {colorName ? (
                      <div className="mt-2 flex">
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-muted dark:border-dark-border dark:bg-dark-bg-hover dark:text-dark-muted">
                          <span className="truncate">{colorName}</span>
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink dark:border-dark-border dark:bg-dark-panel dark:text-surface">
                    {t('quantity', { count: item.quantity })}
                  </span>
                </div>
                <div className="mt-4">
                  {item.product.isDiscounted &&
                  item.product.originalPriceLabel ? (
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold leading-none">
                      <span className="text-danger">
                        {item.product.discountRate}%
                      </span>
                      <span className="text-muted line-through dark:text-dark-muted">
                        {item.product.originalPriceLabel}
                      </span>
                    </p>
                  ) : null}
                  <p className="text-base font-bold leading-6 lg:text-lg">
                    {item.product.priceLabel ??
                      t('currency', {
                        amount: format.number(item.product.price),
                      })}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
