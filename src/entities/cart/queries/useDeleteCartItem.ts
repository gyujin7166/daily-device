import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { deleteCartItem } from '@entities/cart/api/cart';
import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import type { CartResponse } from '@entities/cart/model/types';
import {
  cartMutationKeys,
  cartQueryKeys,
} from '@entities/cart/queries/queryKeys';

export const useDeleteCartItem = () => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const cartQueryKey = cartQueryKeys.cart(locale);

  return useMutation({
    mutationKey: cartMutationKeys.deleteCartItem(),
    mutationFn: deleteCartItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const prevCart = queryClient.getQueryData<CartResponse>(cartQueryKey);

      if (prevCart) {
        const updatedItems = prevCart.items.filter(
          (item) =>
            !(
              (typeof newItem.cartItemId === 'number' &&
                item.id === newItem.cartItemId) ||
              isSameCartVariant(item, newItem)
            ),
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
    onError: (_err, _variables, context) => {
      if (context?.prevCart) {
        queryClient.setQueryData(cartQueryKey, context.prevCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
};
