import { notFound } from 'next/navigation';

import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getProductReviewGalleryBySlug } from '@app/api-routes/product-reviews/gallery/service';
import { getProductReviewsBySlug } from '@app/api-routes/product-reviews/service';
import { getProductImageListBySlug } from '@app/api-routes/products/[slug]/images/service';
import { getProductDetailBySlug } from '@app/api-routes/products/[slug]/service';
import { getRecommendedProductsList } from '@app/api-routes/products/recommended/service';

import { productQueryKeys } from '@entities/product/queries/queryKeys';
import { PRODUCT_REVIEW_GALLERY_PAGE_SIZE } from '@entities/review/api/review';
import { PRODUCT_REVIEW_PER_PAGE } from '@entities/review/model/constants';
import type { ProductReviewGalleryPageResponse } from '@entities/review/model/types';
import { productReviewQueryKeys } from '@entities/review/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import ProductDetailPageContainer from './ProductDetailPageContainer';

type ProductDetailPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { category, slug: detail } = await params;
  const currentPath = getProductHref({
    categorySlug: category,
    productSlug: detail,
  });
  const queryClient = new QueryClient();
  const slug = decodeURIComponent(detail);
  const normalizedCategory = decodeURIComponent(category).trim();

  const productDetail = await queryClient.fetchQuery({
    queryKey: productQueryKeys.detail(slug),
    queryFn: () => getProductDetailBySlug(slug),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  if (
    !productDetail.product ||
    productDetail.product.category.slug !== normalizedCategory
  ) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: productQueryKeys.images(slug),
    queryFn: () => getProductImageListBySlug(slug),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  await queryClient.prefetchQuery({
    queryKey: productReviewQueryKeys.reviews(slug, 1, 'latest', 'all', 'guest'),
    queryFn: () =>
      getProductReviewsBySlug(slug, 1, PRODUCT_REVIEW_PER_PAGE, 'latest'),
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: productReviewQueryKeys.gallery(
      slug,
      PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
      'guest',
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProductReviewGalleryBySlug(
        slug,
        Number(pageParam),
        PRODUCT_REVIEW_GALLERY_PAGE_SIZE,
      ),
    getNextPageParam: (lastPage: ProductReviewGalleryPageResponse) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const excludeId = productDetail?.product?.id;
  if (excludeId) {
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.recommended(normalizedCategory, excludeId, 10),
      queryFn: () =>
        getRecommendedProductsList({
          category: normalizedCategory,
          excludeId,
          limit: 10,
        }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  }

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <ProductDetailPageContainer
        category={category}
        detail={detail}
        currentPath={currentPath}
      />
    </HydrationBoundary>
  );
}
