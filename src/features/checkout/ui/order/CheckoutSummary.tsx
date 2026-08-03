import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import type { UserCartItem } from '@entities/cart/model/types';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import { toast } from '@shared/lib/toast';

import OrderSummaryPriceTable from './OrderSummaryPriceTable';

type CheckoutSummaryProps = {
  items: UserCartItem[];
  totalPrice: number;
  disableCartSyncEffects?: boolean;
};

export default function CheckoutSummary({
  items,
  totalPrice,
  disableCartSyncEffects = false,
}: CheckoutSummaryProps) {
  const locale = useLocale();
  const t = useTranslations('Checkout.summary');
  const queryClient = useQueryClient();
  const cartQueryKey = cartQueryKeys.cart(locale);
  const prevTotalQuantityRef = useRef(0);
  const refetchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (disableCartSyncEffects) {
      prevTotalQuantityRef.current = totalQuantity;
      return;
    }
    if (prevTotalQuantityRef.current === 0) {
      prevTotalQuantityRef.current = totalQuantity;
      return;
    }

    const timer = setTimeout(() => {
      if (totalQuantity !== prevTotalQuantityRef.current) {
        toast.info(t('cartChanged'));
        prevTotalQuantityRef.current = totalQuantity;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [disableCartSyncEffects, t, totalQuantity]);

  useEffect(() => {
    if (disableCartSyncEffects) {
      return;
    }

    const refetchCart = () => {
      if (typeof document !== 'undefined') {
        const isScrollLocked = document.body.style.overflow === 'hidden';
        if (isScrollLocked) {
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: cartQueryKey });

      if (refetchDelayRef.current) {
        clearTimeout(refetchDelayRef.current);
      }

      refetchDelayRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
      }, 600);
    };

    const handleWindowFocus = () => {
      refetchCart();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchCart();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (refetchDelayRef.current) {
        clearTimeout(refetchDelayRef.current);
      }
    };
  }, [cartQueryKey, disableCartSyncEffects, queryClient]);

  return <OrderSummaryPriceTable totalPrice={totalPrice} />;
}
