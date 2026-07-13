import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { deleteWishlist } from '@entities/wishlist/api/wishlist';
import type { WishlistItem } from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

export const useDeleteWishlist = () => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const listQueryKey = wishlistQueryKeys.list(locale);

  return useMutation({
    mutationKey: wishlistQueryKeys.deleteMutation(),
    mutationFn: deleteWishlist,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({
        queryKey: listQueryKey,
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(listQueryKey) ?? [];
      const nextItems = previousItems.filter((item) => item.id !== productId);
      queryClient.setQueryData<WishlistItem[]>(listQueryKey, nextItems);
      return { previousItems };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }
      queryClient.setQueryData(listQueryKey, context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
  });
};
