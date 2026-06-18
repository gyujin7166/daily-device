import { useQuery } from '@tanstack/react-query';

import { getCategory } from '@entities/category/api/category';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { productQueryKeys } from './queryKeys';

export const useCategory = () => {
  return useQuery({
    queryKey: productQueryKeys.categories(),
    queryFn: getCategory,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
