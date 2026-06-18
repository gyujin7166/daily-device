import { useParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getHero } from '@entities/product/api/product';
import type { HeroTypeValue } from '@entities/product/model/types';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { productQueryKeys } from './queryKeys';

type UseHeroProps = {
  type: HeroTypeValue;
  category?: string;
};

export const useHero = ({ type, category: categoryParam }: UseHeroProps) => {
  const params = useParams<{ category?: string }>();
  const category = categoryParam ?? params?.category;

  return useQuery({
    queryKey: productQueryKeys.hero(type, category),
    queryFn: () => getHero(type, category),
    placeholderData: keepPreviousData,
    enabled: !!type,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: shouldRetryQuery,
  });
};
