import { PRODUCT_REVIEW_PER_PAGE } from '@entities/review/model/constants';
import type { ProductReviewFilter } from '@entities/review/model/filter';
import type { ProductReviewSortOption } from '@entities/review/model/sort';
import type {
  ProductReviewFeedbackSummary,
  ProductReviewGalleryPageResponse,
  ProductReviewsPayload,
  UpsertProductReviewFeedbackVariables,
} from '@entities/review/model/types';

import { fetchApi, fetchApiResponse } from '@shared/api/fetchApi';

import type { ProductReview, ProductReviewImage } from '@prisma/client';

type CreateReviewVariables = {
  productId: number;
  orderItemId: number;
  rating: number;
  title: string;
  content: string;
  images: Array<
    Pick<ProductReviewImage, 'image_url' | 'order'> & {
      blur_data_url?: string | null;
    }
  >;
};

type CreateReviewResponse = Omit<
  Pick<
    ProductReview,
    | 'id'
    | 'userId'
    | 'productId'
    | 'orderItemId'
    | 'rating'
    | 'title'
    | 'content'
    | 'createdAt'
    | 'updatedAt'
  >,
  'createdAt' | 'updatedAt'
> & {
  createdAt: string;
  updatedAt: string;
};

export const PRODUCT_REVIEW_GALLERY_PAGE_SIZE = 20;

export const upsertProductReview = (
  data: CreateReviewVariables,
): Promise<CreateReviewResponse> =>
  fetchApi('/api/product-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const upsertProductReviewFeedback = (
  data: UpsertProductReviewFeedbackVariables,
): Promise<ProductReviewFeedbackSummary> =>
  fetchApi('/api/product-reviews/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

export const getProductReviews = (
  slug: string,
  page: number,
  sort: ProductReviewSortOption,
  filter: ProductReviewFilter = 'all',
  locale?: string,
): Promise<ProductReviewsPayload> => {
  const params = new URLSearchParams({
    slug,
    page: `${page}`,
    perPage: `${PRODUCT_REVIEW_PER_PAGE}`,
    sort,
    filter,
  });
  if (locale) {
    params.set('locale', locale);
  }

  return fetchApi(`/api/product-reviews?${params.toString()}`);
};

export const getProductReviewGalleryPage = (
  slug: string,
  page: number,
  limit: number,
  locale?: string,
): Promise<ProductReviewGalleryPageResponse> => {
  const params = new URLSearchParams({
    slug,
    page: `${page}`,
    limit: `${limit}`,
  });
  if (locale) {
    params.set('locale', locale);
  }

  return fetchApiResponse(`/api/product-reviews/gallery?${params.toString()}`);
};
