import { useParams } from 'next/navigation';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import {
  getProductReviewGalleryPage,
  PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
} from '@entities/review/api/review';
import { productReviewQueryKeys } from '@entities/review/queries/queryKeys';

import { getQueryPageParam } from '@shared/lib/query/getQueryPageParam';
import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

const getEmptyGalleryPage = (page: number) => ({
  items: [],
  total: 0,
  page,
  limit: PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
  hasMore: false,
});

export const useProductReviewGalleryImages = (detailInput?: string) => {
  const params = useParams<{ detail?: string }>();
  const { data: session } = useSession();
  const detail = detailInput ?? params?.detail ?? '';
  const slug = decodeURIComponent(detail);
  // 갤러리 카드의 helpful 상태도 viewer에 따라 달라지므로 목록 캐시와 동일하게 분리한다.
  const viewerKey = session?.user?.id ?? 'guest';

  const query = useInfiniteQuery({
    queryKey: productReviewQueryKeys.gallery(
      slug,
      PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
      viewerKey,
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const page = getQueryPageParam(pageParam);

      if (!slug) {
        return Promise.resolve(getEmptyGalleryPage(page));
      }

      return getProductReviewGalleryPage(
        slug,
        page,
        PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: 'always',
    retry: shouldRetryQuery,
  });

  const images = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? images.length;

  return {
    ...query,
    data: images,
    total,
    pageSize: PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
  };
};
