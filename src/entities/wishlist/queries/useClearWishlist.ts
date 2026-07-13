import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { clearWishlist } from '@entities/wishlist/api/wishlist';
import type { WishlistItem } from '@entities/wishlist/model/types';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

export const useClearWishlist = () => {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const listQueryKey = wishlistQueryKeys.list(locale);

  return useMutation({
    mutationKey: wishlistQueryKeys.clearMutation(),
    mutationFn: clearWishlist,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: listQueryKey,
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(listQueryKey) ?? [];
      queryClient.setQueryData<WishlistItem[]>(listQueryKey, []);
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
