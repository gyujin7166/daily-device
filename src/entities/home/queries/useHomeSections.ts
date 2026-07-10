import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { getHomeSections } from '@entities/home/api/home';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { homeQueryKeys } from './queryKeys';

export const useHomeSections = (keys: string[] = []) => {
  const locale = useLocale();

  return useQuery({
    queryKey: homeQueryKeys.sections(keys, locale),
    queryFn: () => getHomeSections(keys, locale),
    placeholderData: keepPreviousData,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
