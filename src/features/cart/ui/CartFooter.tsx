import { useTransition } from 'react';

import { useIsMutating } from '@tanstack/react-query';
import { useFormatter, useTranslations } from 'next-intl';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import { cartMutationKeys } from '@entities/cart/queries/queryKeys';
import { selectCartItems, useCart } from '@entities/cart/queries/useCart';

import {
  BUY_NOW_CHECKOUT_STORAGE_KEY,
  CHECKOUT_ENTRY_STORAGE_KEY,
} from '@shared/constants/checkout';
import { useRouter } from '@shared/lib/i18n/navigation';
import { cn } from '@shared/lib/utils/style';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

export default function CartFooter() {
  const format = useFormatter();
  const t = useTranslations('Cart');
  const router = useRouter();
  const [isCheckoutRouting, startCheckoutRouting] = useTransition();
  const { data: userCartItems = [] } = useCart({ select: selectCartItems });
  const localCartItems = useCartLocalStore((state) => state.localCartItems);
  const isAddingNewItem = useCartPendingStore(
    (state) => Object.keys(state.pendingAddingItemKeys).length > 0,
  );
  const isCartSyncPending = useCartPendingStore(
    (state) => Object.keys(state.pendingCartSyncKeys).length > 0,
  );
  const quantities = useCartQuantityStore((state) => state.quantities);
  const cartUpsertMutationCount = useIsMutating({
    mutationKey: cartMutationKeys.addToCart(),
  });

  const combinedCartItems = [...userCartItems, ...localCartItems];
  const hasInvalidQuantities = combinedCartItems.some((item) => {
    const variantKey = getCartVariantKey(item);
    const quantity = quantities[variantKey] ?? item.quantity;
    return quantity <= 0 || quantity > 10;
  });
  const isCartMutating = cartUpsertMutationCount > 0 || isCartSyncPending;
  const subtotal = combinedCartItems.reduce((total, item) => {
    const variantKey = getCartVariantKey(item);
    const quantity = quantities[variantKey] ?? item.quantity;
    return total + item.product.price * quantity;
  }, 0);
  const isCheckoutDisabled =
    combinedCartItems.length === 0 ||
    hasInvalidQuantities ||
    isCartMutating ||
    isAddingNewItem;
  const isCheckoutButtonDisabled = isCheckoutDisabled || isCheckoutRouting;
  const shouldShowSyncSpinner =
    isCartMutating || isAddingNewItem || isCheckoutRouting;

  const handleCheckout = () => {
    if (isCheckoutButtonDisabled) {
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(CHECKOUT_ENTRY_STORAGE_KEY, 'cart');
      window.sessionStorage.removeItem(BUY_NOW_CHECKOUT_STORAGE_KEY);
    }

    startCheckoutRouting(() => {
      router.push('/checkout');
    });
  };

  return (
    <div className="sticky bottom-0 z-10 w-full border-t border-line bg-surface text-sm dark:border-dark-border dark:bg-dark-bg">
      <div className="relative px-6 py-6 text-dark-bg shadow-lg">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm text-muted dark:text-dark-muted">
            <span>{t('subtotal')}</span>
            <span className="font-semibold text-ink dark:text-surface">
              {t('currency', { amount: format.number(subtotal) })}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted dark:text-dark-muted">
            <span>{t('shippingFee')}</span>
            <span className="font-semibold text-primary dark:text-surface">
              {t('free')}
            </span>
          </div>
          <div className="h-px w-full bg-line dark:bg-dark-bg-hover" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink dark:text-surface">
              {t('total')}
            </span>
            <span className="text-2xl font-bold text-primary dark:text-surface">
              {t('currency', { amount: format.number(subtotal) })}
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={isCheckoutButtonDisabled}
          aria-busy={isCheckoutRouting}
          onClick={handleCheckout}
          className={cn(
            'mt-5 inline-flex h-13 w-full items-center justify-center rounded-xl text-base font-semibold transition-colors',
            isCheckoutButtonDisabled
              ? 'cursor-not-allowed bg-disabled-bg text-disabled-text dark:bg-dark-bg-hover dark:text-dark-muted'
              : 'bg-primary text-on-primary hover:bg-primary-hover',
          )}
        >
          {shouldShowSyncSpinner ? (
            <>
              <Spinner size="sm" variant="primary" className="size-5" />
              <span className="sr-only">{t('syncing')}</span>
            </>
          ) : (
            t('checkout')
          )}
        </button>
      </div>
    </div>
  );
}
