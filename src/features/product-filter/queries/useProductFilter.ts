import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { getProductFilter } from '../api/productFilter';

import { productFilterQueryKeys } from './queryKeys';

export const useProductFilter = (categoryParam?: string) => {
  const locale = useLocale();
  const params = useParams<{ category?: string }>();
  const category = categoryParam ?? params?.category;

  return useQuery({
    queryKey: productFilterQueryKeys.filters(category, locale),
    queryFn: () => getProductFilter(category!, locale),
    enabled: !!category,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
