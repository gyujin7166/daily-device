import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearWishlist } from '@entities/wishlist/api/wishlist';
import type { WishlistItem } from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

export const useClearWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: wishlistQueryKeys.clearMutation(),
    mutationFn: clearWishlist,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: wishlistQueryKeys.list(),
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(wishlistQueryKeys.list()) ??
        [];
      queryClient.setQueryData<WishlistItem[]>(wishlistQueryKeys.list(), []);
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
