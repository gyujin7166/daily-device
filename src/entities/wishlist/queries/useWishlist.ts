import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

import { getWishlist } from '@entities/wishlist/api/wishlist';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

export const useWishlist = () => {
  const locale = useLocale();
  const { status } = useSession();

  return useQuery({
    queryKey: wishlistQueryKeys.list(locale),
    queryFn: () => getWishlist(locale),
    enabled: status === 'authenticated',
    staleTime: 0,
    retry: shouldRetryQuery,
  });
};

export const useSuspenseWishlist = () => {
  const locale = useLocale();

  return useSuspenseQuery({
    queryKey: wishlistQueryKeys.list(locale),
    queryFn: () => getWishlist(locale),
    staleTime: 0,
    retry: shouldRetryQuery,
  });
};
