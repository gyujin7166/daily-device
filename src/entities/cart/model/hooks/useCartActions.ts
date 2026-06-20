import { useRef } from 'react';

import { useSession } from 'next-auth/react';

import { getCartVariantKey } from '@entities/cart/lib/cartItemVariant';
import {
  bumpCartVariantMutationRevision,
} from '@entities/cart/lib/cartMutationRevision';

import { useAddToCart } from '../../queries/useAddToCart';
import { useDeleteCartItem } from '../../queries/useDeleteCartItem';
import { useCartContext } from '../context/CartContext';

import useLocalCartActions from './useLocalCartActions';

import type { CartItem } from '@prisma/client';

export default function useCartActions() {
  const CART_SYNC_DEBOUNCE_MS = 300;
  const { mutateAsync: addToCartMutateAsync, isSuccess: addToCartIsSuccess } =
    useAddToCart();
  const { mutate: deleteCartItemMutate } = useDeleteCartItem();
  const { deleteLocalCartItem, updateLocalCart } = useLocalCartActions();
  const {
    quantities,
    setQuantities,
    startAddingNewItem,
    finishAddingNewItem,
    startCartSync,
    finishCartSync,
    isCartVariantAdding,
    isCartVariantMutationPending,
  } = useCartContext();
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
    isDirectInput = false,
    skipIfPending = false,
    event,
  }: Pick<CartItem, 'productId'> &
    Partial<Pick<CartItem, 'quantity'>> & {
      cartItemId?: number;
      productColorId?: number;
      colorName?: string;
      isDirectInput?: boolean;
      skipIfPending?: boolean;
      event?: React.ChangeEvent<HTMLInputElement>;
    }) => {
    const variantKey = getCartVariantKey({
      productId,
      productColorId,
      colorName,
    });

    const currentQuantity = quantities[variantKey] ?? 0;

    if (skipIfPending && isCartVariantMutationPending(variantKey)) {
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

    setQuantities((prev) => ({
      ...prev,
      [variantKey]: nextQuantity,
    }));

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
            await addToCartMutateAsync({
              productId,
              quantity: nextQuantity,
              cartItemId,
              productColorId,
              colorName,
              clientRevision,
            });
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
      updateLocalCart({
        productId,
        quantity: nextQuantity,
        cartItemId,
        productColorId,
        colorName,
      });
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

    if (isCartVariantAdding(variantKey)) {
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
      setQuantities((prev) => {
        const { [variantKey]: _removed, ...rest } = prev;
        return rest;
      });

      deleteCartItemMutate({
        cartItemId,
        productId,
        productColorId,
        colorName,
      });
    } else if (status === 'unauthenticated') {
      deleteLocalCartItem({ productId, productColorId, colorName });
      setQuantities((prev) => {
        const { [variantKey]: _, ...updatedQuantities } = prev;
        return updatedQuantities;
      });
    }
  };

  return {
    handleUpsertCartItem,
    handleDeleteCartItem,
    addToCartIsSuccess,
  };
}
