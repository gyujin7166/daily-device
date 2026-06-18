import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteWishlist } from '@entities/wishlist/api/wishlist';
import type { WishlistItem } from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

export const useDeleteWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: wishlistQueryKeys.deleteMutation(),
    mutationFn: deleteWishlist,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: wishlistQueryKeys.list(),
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(wishlistQueryKeys.list()) ??
        [];
      const nextItems = previousItems.filter((item) => item.id !== productId);
      queryClient.setQueryData<WishlistItem[]>(
        wishlistQueryKeys.list(),
        nextItems,
      );
      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData(wishlistQueryKeys.list(), context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.list() });
    },
  });
};
