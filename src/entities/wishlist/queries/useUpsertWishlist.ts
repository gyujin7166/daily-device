import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  const queryClient = useQueryClient();
  const listQueryKey = wishlistQueryKeys.list(locale);

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
        queryKey: listQueryKey,
      });
      const previousItems =
        queryClient.getQueryData<WishlistItem[]>(listQueryKey) ?? [];
      const nextItems = [
        item,
        ...previousItems.filter((wishlistItem) => wishlistItem.id !== item.id),
      ];
      queryClient.setQueryData<WishlistItem[]>(
        listQueryKey,
        nextItems,
      );
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
