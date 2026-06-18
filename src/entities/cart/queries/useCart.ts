import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getCart } from '@entities/cart/api/cart';
import { cartQueryKeys } from '@entities/cart/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

export const useCart = () => {
  const { data: session } = useSession();
  return useQuery({
    queryKey: cartQueryKeys.cart(),
    queryFn: getCart,
    enabled: !!session?.user,
    staleTime: 0,
    retry: shouldRetryQuery,
  });
};
