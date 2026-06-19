import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { getRecommendedProducts } from '@entities/product/api/product';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

type UseRecommendedProductsParams = {
  category?: string;
  excludeId?: number;
  limit?: number;
  enabled?: boolean;
};

export const useSuspenseRecommendedProducts = ({
  category,
  excludeId,
  limit = 10,
  enabled = true,
}: UseRecommendedProductsParams) => {
  const normalizedCategory = category?.trim();

  return useSuspenseQuery({
    queryKey: productQueryKeys.recommended(
      normalizedCategory,
      excludeId,
      limit,
    ),
    queryFn: () => {
      if (!normalizedCategory || !enabled) {
        return Promise.resolve([]);
      }

      return getRecommendedProducts(normalizedCategory, excludeId, limit);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};

export const useRecommendedProducts = ({
  category,
  excludeId,
  limit = 10,
  enabled = true,
}: UseRecommendedProductsParams) => {
  const normalizedCategory = category?.trim();

  return useQuery({
    queryKey: productQueryKeys.recommended(
      normalizedCategory,
      excludeId,
      limit,
    ),
    queryFn: () => getRecommendedProducts(normalizedCategory, excludeId, limit),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
