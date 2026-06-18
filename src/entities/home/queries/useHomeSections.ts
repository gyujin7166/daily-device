import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getHomeSections } from '@entities/home/api/home';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { homeQueryKeys } from './queryKeys';

export const useHomeSections = (keys: string[] = []) => {
  return useQuery({
    queryKey: homeQueryKeys.sections(keys),
    queryFn: () => getHomeSections(keys),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
