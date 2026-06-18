import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getWishlist } from '@entities/wishlist/api/wishlist';
import { wishlistQueryKeys } from '@entities/wishlist/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

export const useWishlist = () => {
  const { status } = useSession();

  return useQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getWishlist,
    enabled: status === 'authenticated',
    staleTime: 0,
    retry: shouldRetryQuery,
  });
};

export const useSuspenseWishlist = () => {
  return useSuspenseQuery({
    queryKey: wishlistQueryKeys.list(),
    queryFn: getWishlist,
    staleTime: 0,
    retry: shouldRetryQuery,
  });
};
