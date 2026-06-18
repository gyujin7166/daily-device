import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteCartItem } from '@entities/cart/api/cart';
import { isSameCartVariant } from '@entities/cart/lib/cartItemVariant';
import type { CartResponse } from '@entities/cart/model/types';
import {
  cartMutationKeys,
  cartQueryKeys,
} from '@entities/cart/queries/queryKeys';

export const useDeleteCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: cartMutationKeys.deleteCartItem(),
    mutationFn: deleteCartItem,
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKeys.cart() });
      const prevCart = queryClient.getQueryData<CartResponse>(
        cartQueryKeys.cart(),
      );

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

        queryClient.setQueryData<CartResponse>(cartQueryKeys.cart(), {
          ...prevCart,
          items: updatedItems,
          totalPrice: updatedTotalPrice,
        });
      }

      return { prevCart };
    },
    onError: (_err, _variables, context) => {
      if (context?.prevCart) {
        queryClient.setQueryData(cartQueryKeys.cart(), context.prevCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.cart() });
    },
  });
};
