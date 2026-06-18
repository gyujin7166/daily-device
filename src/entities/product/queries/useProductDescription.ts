import { useParams } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { getProductDescription } from '@entities/product/api/product';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { productQueryKeys } from './queryKeys';

export const useProductDescription = (detailInput?: string) => {
  const params = useParams<{ detail?: string }>();
  const detail = detailInput ?? params?.detail ?? '';
  const slug = decodeURIComponent(detail);

  return useQuery({
    queryKey: productQueryKeys.detail(slug),
    queryFn: () => getProductDescription(slug),
    enabled: slug.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
