import { useRef } from 'react';

import { useSession } from 'next-auth/react';

import {
  getCartVariantKey,
  isSameCartVariant,
} from '@entities/cart/lib/cartItemVariant';
import {
  bumpCartVariantMutationRevision,
  isCartVariantMutationCurrent,
} from '@entities/cart/lib/cartMutationRevision';
import { useCartLocalStore } from '@entities/cart/model/store/cartLocalStore';
import { useCartPendingStore } from '@entities/cart/model/store/cartPendingStore';
import { useCartQuantityStore } from '@entities/cart/model/store/cartQuantityStore';
import type { LocalCartItem } from '@entities/cart/model/types';

import {
  toEcommerceItem,
  trackEcommerceEvent,
} from '@shared/lib/analytics/ecommerce';

import { useAddToCart } from '../../queries/useAddToCart';
import { useDeleteCartItem } from '../../queries/useDeleteCartItem';

import useLocalCartActions from './useLocalCartActions';

import type { CartItem } from '@prisma/client';

export default function useCartActions() {
  const CART_SYNC_DEBOUNCE_MS = 300;
  const { mutateAsync: addToCartMutateAsync, isSuccess: addToCartIsSuccess } =
    useAddToCart();
  const { mutate: deleteCartItemMutate } = useDeleteCartItem();
  const { deleteLocalCartItem, updateLocalCart } = useLocalCartActions();
  const {
    finishAddingNewItem,
    finishCartSync,
    startAddingNewItem,
    startCartSync,
  } = useCartPendingStore((state) => state.actions);
  const { removeQuantity, setQuantity } = useCartQuantityStore(
    (state) => state.actions,
  );
  const { status } = useSession();
  const cartSyncDebounceTimersRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
  const cartSyncRevisionRef = useRef<Record<string, number>>({});

  const handleUpsertCartItem = async ({
    productId,
    quantity,
    cartItemId,
    productColorId,
    colorName,
    product,
    isDirectInput = false,
    skipIfPending = false,
    trackAddToCart = false,
    event,
  }: Pick<CartItem, 'productId'> &
    Partial<Pick<CartItem, 'quantity'>> & {
      cartItemId?: number;
      productColorId?: number;
      colorName?: string;
      product?: LocalCartItem['product'];
      isDirectInput?: boolean;
      skipIfPending?: boolean;
      trackAddToCart?: boolean;
      event?: React.ChangeEvent<HTMLInputElement>;
    }) => {
    const variantKey = getCartVariantKey({
      productId,
      productColorId,
      colorName,
    });

    const currentQuantity =
      useCartQuantityStore.getState().quantities[variantKey] ?? 0;

    const pendingState = useCartPendingStore.getState();
    const isVariantMutationPending = Boolean(
      pendingState.pendingAddingItemKeys[variantKey] ||
      pendingState.pendingCartSyncKeys[variantKey],
    );

    if (skipIfPending && isVariantMutationPending) {
      return;
    }

    let inputQuantity = currentQuantity;

    if (event) {
      const value = event.target.value;
      const regex = /^[0-9]*$/;

      if (!regex.test(value)) {
        return;
      }

      if (value === '') {
        inputQuantity = 0;
      } else if (
        value.length > 1 &&
        currentQuantity === 1 &&
        value.startsWith('1') &&
        value !== '10'
      ) {
        inputQuantity = Number(value.slice(1));
      } else {
        inputQuantity = Number(value);
      }
    } else if (isDirectInput && typeof quantity === 'number') {
      inputQuantity = quantity;
    }

    let nextQuantity = currentQuantity;

    if (isDirectInput) {
      nextQuantity = inputQuantity <= 0 ? 1 : Math.min(inputQuantity, 10);
    } else if (!isDirectInput && quantity) {
      nextQuantity = Math.min(currentQuantity + quantity, 10);
    }

    if (nextQuantity === currentQuantity) {
      return;
    }

    const trackAddedItem = (item: LocalCartItem, previousQuantity: number) => {
      const addedQuantity = item.quantity - previousQuantity;
      if (trackAddToCart && addedQuantity > 0) {
        trackEcommerceEvent('add_to_cart', [
          toEcommerceItem({ ...item, quantity: addedQuantity }),
        ]);
      }
    };

    setQuantity(variantKey, nextQuantity);

    const isNewItem =
      !isDirectInput &&
      status === 'authenticated' &&
      currentQuantity === 0 &&
      nextQuantity > 0;

    if (isNewItem) {
      startAddingNewItem(variantKey);
    }

    if (status === 'authenticated') {
      const clientRevision = bumpCartVariantMutationRevision(variantKey);
      const nextRevision = (cartSyncRevisionRef.current[variantKey] ?? 0) + 1;
      cartSyncRevisionRef.current[variantKey] = nextRevision;
      startCartSync(variantKey);

      const prevTimer = cartSyncDebounceTimersRef.current[variantKey];
      if (prevTimer) {
        clearTimeout(prevTimer);
      }

      // 수량 버튼을 빠르게 누를 때 마지막 값만 서버에 보내고, variant별 sync 상태는 revision으로 보호한다.
      cartSyncDebounceTimersRef.current[variantKey] = setTimeout(() => {
        delete cartSyncDebounceTimersRef.current[variantKey];

        void (async () => {
          try {
            const nextCart = await addToCartMutateAsync({
              productId,
              quantity: nextQuantity,
              cartItemId,
              productColorId,
              colorName,
              clientRevision,
            });
            if (isCartVariantMutationCurrent(variantKey, clientRevision)) {
              const addedItem = nextCart.items.find((item) =>
                isSameCartVariant(item, {
                  productId,
                  productColorId,
                  colorName,
                }),
              );
              if (addedItem) {
                trackAddedItem(addedItem, currentQuantity);
              }
            }
          } catch {
            // useAddToCart의 onError에서 rollback을 처리한다.
          } finally {
            const latestRevision = cartSyncRevisionRef.current[variantKey] ?? 0;
            if (latestRevision === nextRevision) {
              finishCartSync(variantKey);
              finishAddingNewItem(variantKey);
            }
          }
        })();
      }, CART_SYNC_DEBOUNCE_MS);
    } else if (status === 'unauthenticated') {
      const previousLocalQuantity =
        useCartLocalStore
          .getState()
          .localCartItems.find((item) => getCartVariantKey(item) === variantKey)
          ?.quantity ?? 0;
      updateLocalCart({
        productId,
        quantity: nextQuantity,
        cartItemId,
        productColorId,
        colorName,
        product,
      });
      const addedItem = useCartLocalStore
        .getState()
        .localCartItems.find((item) => getCartVariantKey(item) === variantKey);
      if (addedItem) {
        trackAddedItem(addedItem, previousLocalQuantity);
      }
    }
  };

  const handleDeleteCartItem = async ({
    productId,
    cartItemId,
    productColorId,
    colorName,
  }: Pick<CartItem, 'productId'> & {
    cartItemId?: number;
    productColorId?: number;
    colorName?: string;
  }) => {
    const variantKey = getCartVariantKey({
      productId,
      productColorId,
      colorName,
    });

    if (useCartPendingStore.getState().pendingAddingItemKeys[variantKey]) {
      return;
    }

    if (status === 'authenticated') {
      bumpCartVariantMutationRevision(variantKey);
      cartSyncRevisionRef.current[variantKey] =
        (cartSyncRevisionRef.current[variantKey] ?? 0) + 1;

      const pendingTimer = cartSyncDebounceTimersRef.current[variantKey];
      if (pendingTimer) {
        clearTimeout(pendingTimer);
        delete cartSyncDebounceTimersRef.current[variantKey];
      }

      finishCartSync(variantKey);
      finishAddingNewItem(variantKey);
      removeQuantity(variantKey);

      deleteCartItemMutate({
        cartItemId,
        productId,
        productColorId,
        colorName,
      });
    } else if (status === 'unauthenticated') {
      deleteLocalCartItem({ productId, productColorId, colorName });
      removeQuantity(variantKey);
    }
  };

  return {
    handleUpsertCartItem,
    handleDeleteCartItem,
    addToCartIsSuccess,
  };
}
