'use client';

import { useEffect, useRef } from 'react';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import useMergeLocalCart from '@entities/cart/model/hooks/useMergeLocalCart';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { UserCartItem } from '@entities/cart/model/types';
import { selectCartItems, useCart } from '@entities/cart/queries/useCart';

const EMPTY_USER_CART_ITEMS: UserCartItem[] = [];

export default function CartStateSynchronizer() {
  const { data: session, status } = useSession();
  const hasLocalCartHydrated = useCartLocalStore((state) => state.hasHydrated);
  const hasStartedLocalCartHydrationRef = useRef(false);
  const isMergingLocalCartRef = useRef(false);
  const mergedUserIdRef = useRef<string | null>(null);
  const { mergeLocalCart } = useMergeLocalCart();
  const {
    data: userCartItems = EMPTY_USER_CART_ITEMS,
    isFetched: isUserCartFetched,
  } = useCart({ select: selectCartItems });
  const { replaceQuantities, resetQuantities } = useCartQuantityStore(
    (state) => state.actions,
  );
  const { finishCartSync, resetPendingState, startCartSync } =
    useCartPendingStore((state) => state.actions);

  useEffect(() => {
    if (hasStartedLocalCartHydrationRef.current) {
      return;
    }

    hasStartedLocalCartHydrationRef.current = true;
    void useCartLocalStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      const initialQuantities = userCartItems.reduce(
        (acc, item) => ({
          ...acc,
          [getCartVariantKey(item)]: item.quantity,
        }),
        {} satisfies Record<string, number>,
      );
      replaceQuantities(initialQuantities);
    } else if (status === 'unauthenticated' && hasLocalCartHydrated) {
      const localCartItems = useCartLocalStore.getState().localCartItems;
      const initialQuantities = localCartItems.reduce(
        (acc, item) => ({
          ...acc,
          [getCartVariantKey(item)]: item.quantity,
        }),
        {} satisfies Record<string, number>,
      );
      replaceQuantities(initialQuantities);
    }
  }, [hasLocalCartHydrated, replaceQuantities, status, userCartItems]);

  useEffect(
    () => () => {
      resetPendingState();
      resetQuantities();
    },
    [resetPendingState, resetQuantities],
  );

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user.id) {
      mergedUserIdRef.current = null;
      isMergingLocalCartRef.current = false;
      return;
    }

    if (
      !hasLocalCartHydrated ||
      !isUserCartFetched ||
      isMergingLocalCartRef.current
    ) {
      return;
    }

    if (mergedUserIdRef.current === session.user.id) {
      return;
    }

    const localCartItems = useCartLocalStore.getState().localCartItems;

    if (localCartItems.length === 0) {
      mergedUserIdRef.current = session.user.id;
      return;
    }

    mergedUserIdRef.current = session.user.id;
    isMergingLocalCartRef.current = true;
    const mergingVariantKeys = Array.from(
      new Set(localCartItems.map(getCartVariantKey)),
    );
    mergingVariantKeys.forEach(startCartSync);

    void mergeLocalCart(localCartItems, userCartItems)
      .catch(() => {
        mergedUserIdRef.current = null;
      })
      .finally(() => {
        mergingVariantKeys.forEach(finishCartSync);
        isMergingLocalCartRef.current = false;
      });
  }, [
    finishCartSync,
    hasLocalCartHydrated,
    isUserCartFetched,
    mergeLocalCart,
    session?.user.id,
    startCartSync,
    status,
    userCartItems,
  ]);

  return null;
}
