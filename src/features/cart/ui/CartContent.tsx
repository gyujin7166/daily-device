import { memo } from 'react';
import type { SubmitEvent } from 'react';

import Image from 'next/image';

import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';
import { useFormatter, useTranslations } from 'next-intl';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import useCartActions from '@entities/cart/model/hooks/useCartActions';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { LocalCartItem, UserCartItem } from '@entities/cart/model/types';

import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';
import { cn } from '@shared/lib/utils/style';

type CartContentProps = {
  item: UserCartItem | LocalCartItem;
};

function CartContent({ item }: CartContentProps) {
  const format = useFormatter();
  const t = useTranslations('Cart');
  const variantKey = getCartVariantKey(item);
  const { handleUpsertCartItem, handleDeleteCartItem } = useCartActions();
  const isVariantAdding = useCartPendingStore((state) =>
    Boolean(state.pendingAddingItemKeys[variantKey]),
  );
  const quantity = useCartQuantityStore(
    (state) => state.quantities[variantKey],
  );
  const displayedQuantity = quantity ?? item.quantity ?? 0;

  return (
    <li className="rounded-xl border border-line bg-surface p-3 shadow-xs transition-shadow hover:shadow-md sm:p-4 dark:border-dark-border dark:bg-dark-panel dark:shadow-xs dark:hover:shadow-md">
      <div className="flex gap-3 sm:gap-4">
        <div className="flex h-26 w-26 shrink-0 items-center justify-center rounded-md bg-line p-2.5 sm:h-34 sm:w-34 sm:p-3 dark:bg-dark-bg-hover">
          <Image
            src={getCloudinaryImageUrl(
              item.product.image_url,
              'orderThumbnail',
            )}
            alt={item.product.name_en}
            width={0}
            height={0}
            sizes="15vw"
            className="h-full w-full object-contain"
            loading="eager"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-28 flex-col sm:min-h-32">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="truncate pr-2 text-sm font-semibold tracking-tight text-ink sm:text-base dark:text-surface">
                  {item.product.name_en}
                </h2>
                <button
                  className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 dark:text-dark-muted dark:hover:bg-dark-bg-hover dark:hover:text-surface"
                  type="button"
                  onClick={() => {
                    handleDeleteCartItem({
                      cartItemId: 'id' in item ? item.id : undefined,
                      productId: item.productId,
                      productColorId: item.productColorId ?? undefined,
                      colorName: item.colorName ?? undefined,
                    });
                  }}
                  disabled={isVariantAdding}
                  aria-label={t('deleteItem')}
                >
                  <IconTrash size={18} stroke={1.6} />
                </button>
              </div>
              <div>
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
                <p className="text-base font-semibold leading-none text-primary sm:text-lg dark:text-surface">
                  {item.product.priceLabel ??
                    t('currency', {
                      amount: format.number(item.product.price),
                    })}
                </p>
              </div>
              {item.colorName ? (
                <p className="mt-1.5 text-xs text-muted sm:text-sm dark:text-dark-muted">
                  {t('color')}{' '}
                  <span className="font-medium text-ink dark:text-surface">
                    {item.colorName}
                  </span>
                </p>
              ) : null}
            </div>

            <form
              className="mt-auto pt-2"
              onSubmit={(event: SubmitEvent<HTMLFormElement>) => {
                event.preventDefault();
              }}
            >
              <div className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-1 shadow-xs dark:border-dark-border dark:bg-dark-bg">
                <button
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors dark:text-dark-muted',
                    displayedQuantity <= 1
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-primary-soft dark:hover:bg-dark-bg-hover hover:text-primary',
                  )}
                  type="button"
                  onClick={() => {
                    handleUpsertCartItem({
                      cartItemId: 'id' in item ? item.id : undefined,
                      productId: item.productId,
                      quantity: -1,
                      productColorId: item.productColorId ?? undefined,
                      colorName: item.colorName ?? undefined,
                    });
                  }}
                  disabled={displayedQuantity <= 1}
                  aria-label={t('decreaseQuantity')}
                >
                  <IconMinus size={16} stroke={2} />
                </button>
                <input
                  className="h-7 w-8 bg-transparent text-center text-lg font-semibold leading-none text-ink outline-hidden [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:text-surface"
                  value={displayedQuantity ?? ''}
                  onChange={(event) => {
                    handleUpsertCartItem({
                      event,
                      cartItemId: 'id' in item ? item.id : undefined,
                      productId: item.productId,
                      productColorId: item.productColorId ?? undefined,
                      colorName: item.colorName ?? undefined,
                      isDirectInput: true,
                    });
                  }}
                  inputMode="numeric"
                  aria-label={t('quantity')}
                />
                <button
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors dark:text-dark-muted',
                    displayedQuantity >= 10
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:bg-primary-soft dark:hover:bg-dark-bg-hover hover:text-primary',
                  )}
                  type="button"
                  onClick={() => {
                    handleUpsertCartItem({
                      cartItemId: 'id' in item ? item.id : undefined,
                      productId: item.productId,
                      quantity: 1,
                      productColorId: item.productColorId ?? undefined,
                      colorName: item.colorName ?? undefined,
                    });
                  }}
                  disabled={displayedQuantity >= 10}
                  aria-label={t('increaseQuantity')}
                >
                  <IconPlus size={16} stroke={2} />
                </button>
              </div>
            </form>
          </div>
          {displayedQuantity > 10 && (
            <div className="mt-2 h-4 text-xs text-danger">10 Products Max</div>
          )}
          {displayedQuantity === 0 && (
            <div className="mt-2 h-4 text-xs text-danger">1 Product Min</div>
          )}
        </div>
      </div>
    </li>
  );
}

export default memo(CartContent);
