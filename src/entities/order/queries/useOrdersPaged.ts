import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getOrdersPaged } from '@entities/order/api/order';
import type { OrdersMode } from '@entities/order/model/types';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

type UseOrdersPagedParams = {
  mode?: OrdersMode;
  page?: number;
  limit?: number;
  enabled?: boolean;
};

export const useSuspenseOrdersPaged = ({
  mode = 'all',
  page = 1,
  limit = 2,
  enabled = true,
}: UseOrdersPagedParams = {}) => {
  const { status } = useSession();

  return useSuspenseQuery({
    queryKey: orderQueryKeys.suspensePaged(mode, page, limit, status, enabled),
    queryFn: () => getOrdersPaged({ mode, page, limit }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};

export const useOrdersPaged = ({
  mode = 'all',
  page = 1,
  limit = 2,
  enabled = true,
}: UseOrdersPagedParams = {}) => {
  const { status } = useSession();

  return useQuery({
    queryKey: orderQueryKeys.paged(mode, page, limit),
    queryFn: () => getOrdersPaged({ mode, page, limit }),
    enabled: enabled && status === 'authenticated',
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
