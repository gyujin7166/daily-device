import { useEffect, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useCartContext } from '@entities/cart/model/context/CartContext';
import type { UserCartItem } from '@entities/cart/model/types';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import { toast } from '@shared/lib/toast';

import OrderSummaryPriceTable from './OrderSummaryPriceTable';

type CheckoutSummaryProps = {
  items?: UserCartItem[];
  totalPrice?: number;
  disableCartSyncEffects?: boolean;
};

export default function CheckoutSummary({
  items: overrideItems,
  totalPrice: overrideTotalPrice,
  disableCartSyncEffects = false,
}: CheckoutSummaryProps) {
  const queryClient = useQueryClient();
  const { userCartItems, userTotalPrice } = useCartContext();
  const prevTotalQuantityRef = useRef(0);
  const refetchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkoutItems = overrideItems ?? userCartItems;
  const checkoutTotalPrice =
    typeof overrideTotalPrice === 'number'
      ? overrideTotalPrice
      : overrideItems
        ? checkoutItems.reduce(
            (acc, item) => acc + item.quantity * item.product.price,
            0,
          )
        : userTotalPrice;
  const totalQuantity = checkoutItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

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
        toast.info('장바구니 정보가 변경되었습니다.');
        prevTotalQuantityRef.current = totalQuantity;
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [disableCartSyncEffects, totalQuantity]);

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

      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });

      if (refetchDelayRef.current) {
        clearTimeout(refetchDelayRef.current);
      }

      refetchDelayRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
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
  }, [disableCartSyncEffects, queryClient]);

  return <OrderSummaryPriceTable totalPrice={checkoutTotalPrice} />;
}
