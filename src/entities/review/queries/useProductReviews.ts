import { useParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
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
      locale,
    ),
    queryFn: () => getProductReviews(slug, page, sort, filter, locale),
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
