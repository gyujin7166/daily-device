import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getOrders } from '@entities/order/api/order';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

type UseOrdersOptions = {
  enabled?: boolean;
};

export const useOrders = ({ enabled = true }: UseOrdersOptions = {}) => {
  const { status } = useSession();

  return useQuery({
    queryKey: orderQueryKeys.list(),
    queryFn: getOrders,
    enabled: enabled && status === 'authenticated',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
