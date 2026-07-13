import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { addToCart } from '@entities/cart/api/cart';
import type { AddToCartVariables } from '@entities/cart/api/cart';
import {
  getCartVariantKey,
  isSameCartVariant,
} from '@entities/cart/lib/cartItemVariant';
import { isCartVariantMutationCurrent } from '@entities/cart/lib/cartMutationRevision';
import type { CartResponse } from '@entities/cart/model/types';
import {
  cartMutationKeys,
  cartQueryKeys,
} from '@entities/cart/queries/queryKeys';

const mergeCartResponse = (
  prevCart: CartResponse | undefined,
  nextCart: CartResponse,
): CartResponse => {
  if (!prevCart) {
    return nextCart;
  }

  const itemByVariantKey = new Map(
    prevCart.items.map((item) => [getCartVariantKey(item), item]),
  );

  for (const item of nextCart.items) {
    itemByVariantKey.set(getCartVariantKey(item), item);
  }

  const items = [...itemByVariantKey.values()];
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  return {
    ...nextCart,
    items,
    totalPrice,
  };
};

export const useAddToCart = () => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const cartQueryKey = cartQueryKeys.cart(locale);

  return useMutation<
    CartResponse,
    Error,
    AddToCartVariables,
    { prevCart?: CartResponse }
  >({
    mutationKey: cartMutationKeys.addToCart(),
    mutationFn: (variables) => addToCart({ ...variables, locale }),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const prevCart = queryClient.getQueryData<CartResponse>(cartQueryKey);

      if (prevCart) {
        const updatedItems = prevCart.items.map((item) =>
          isSameCartVariant(item, newItem)
            ? {
                ...item,
                quantity: Math.min(newItem.quantity, 10),
              }
            : item,
        );

        const updatedTotalPrice = updatedItems.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0,
        );

        queryClient.setQueryData<CartResponse>(cartQueryKey, {
          ...prevCart,
          items: updatedItems,
          totalPrice: updatedTotalPrice,
        });
      }

      return { prevCart };
    },
    onError: (_error, variables, context) => {
      const variantKey = getCartVariantKey(variables);
      if (!isCartVariantMutationCurrent(variantKey, variables.clientRevision)) {
        return;
      }

      queryClient.setQueryData(cartQueryKey, context?.prevCart);
    },
    onSuccess: (nextCart, variables) => {
      const variantKey = getCartVariantKey(variables);
      if (!isCartVariantMutationCurrent(variantKey, variables.clientRevision)) {
        return;
      }

      queryClient.setQueryData<CartResponse>(cartQueryKey, (prevCart) =>
        mergeCartResponse(prevCart, nextCart),
      );
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
    networkMode: 'always',
  });
};
