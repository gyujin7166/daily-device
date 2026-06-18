import { useMutation, useQueryClient } from '@tanstack/react-query';

import { upsertWishlist } from '@entities/wishlist/api/wishlist';
import type {
  WishlistItem,
  WishlistMutationItem,
} from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

type MutationContext = {
  previousItems: WishlistItem[];
};

export const useUpsertWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WishlistMutationItem,
    Error,
    WishlistItem,
    MutationContext
  >({
    mutationKey: wishlistQueryKeys.upsertMutation(),
    mutationFn: (item) => upsertWishlist(item.id),
    onMutate: async (item) => {
      await queryClient.cancelQueries({
        queryKey: wishlistQueryKeys.list(),
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(wishlistQueryKeys.list()) ??
        [];
      const nextItems = [
        item,
        ...previousItems.filter((wishlistItem) => wishlistItem.id !== item.id),
      ];
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
