import { useParams } from 'next/navigation';

import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getProductReviews } from '@entities/review/api/review';
import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import { productReviewQueryKeys } from '@entities/review/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

export const useProductReviews = (
  detailInput: string,
  page: number,
  sort: ProductReviewSortOption = 'latest',
  filter: ProductReviewFilter = 'all',
) => {
  const params = useParams<{ detail?: string }>();
  const { data: session } = useSession();
  const detail = detailInput ?? params?.detail ?? '';
  const slug = decodeURIComponent(detail);
  // helpful 여부가 사용자별 응답이므로 viewerKey를 캐시 키에 넣어 사용자별 결과를 분리한다.
  const viewerKey = session?.user?.id ?? 'guest';

  return useQuery({
    queryKey: productReviewQueryKeys.reviews(
      slug,
      page,
      sort,
      filter,
      viewerKey,
    ),
    queryFn: () => getProductReviews(slug, page, sort, filter),
    placeholderData: keepPreviousData,
    enabled: slug.length > 0,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: 'always',
    retry: shouldRetryQuery,
  });
};

export const useSuspenseProductReviews = (
  detailInput: string,
  page: number,
  sort: ProductReviewSortOption = 'latest',
  filter: ProductReviewFilter = 'all',
) => {
  const params = useParams<{ detail?: string }>();
  const { data: session } = useSession();
  const detail = detailInput ?? params?.detail ?? '';
  const slug = decodeURIComponent(detail);
  // helpful 여부가 사용자별 응답이므로 viewerKey를 캐시 키에 넣어 사용자별 결과를 분리한다.
  const viewerKey = session?.user?.id ?? 'guest';

  return useSuspenseQuery({
    queryKey: productReviewQueryKeys.reviews(
      slug,
      page,
      sort,
      filter,
      viewerKey,
    ),
    queryFn: () => getProductReviews(slug, page, sort, filter),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: 'always',
    retry: shouldRetryQuery,
  });
};
