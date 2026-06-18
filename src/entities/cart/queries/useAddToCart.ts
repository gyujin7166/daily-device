import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addToCart } from '@entities/cart/api/cart';
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: cartMutationKeys.addToCart(),
    mutationFn: addToCart,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart() });
      const prevCart = queryClient.getQueryData<CartResponse>(
        cartQueryKeys.cart(),
      );

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

        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), {
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

      queryClient.setQueryData(cartQueryKeys.cart(), context?.prevCart);
    },
    onSuccess: (nextCart, variables) => {
      const variantKey = getCartVariantKey(variables);
      if (!isCartVariantMutationCurrent(variantKey, variables.clientRevision)) {
        return;
      }

      queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), (prevCart) =>
        mergeCartResponse(prevCart, nextCart),
      );
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
    },
    networkMode: 'always',
  });
};
