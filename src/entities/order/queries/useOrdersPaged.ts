import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

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
}: UseOrdersPagedParams = {}) => {
  return useSuspenseQuery({
    queryKey: orderQueryKeys.suspensePaged(mode, page, limit),
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
  return useQuery({
    queryKey: orderQueryKeys.paged(mode, page, limit),
    queryFn: () => getOrdersPaged({ mode, page, limit }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
