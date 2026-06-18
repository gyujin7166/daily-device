import type { ProductReview, ProductReviewImage } from '@prisma/client';

export type ProductReviewEditItem = Pick<
  ProductReview,
  'id' | 'productId' | 'rating' | 'title' | 'content'
> & {
  adminHiddenAt: string | null;
  ProductReviewImage: Array<
    Pick<ProductReviewImage, 'image_url' | 'blur_data_url' | 'order'>
  >;
};

export type ProductReviewListItem = Omit<
  Pick<
    ProductReview,
    'id' | 'productId' | 'rating' | 'title' | 'content' | 'createdAt'
  >,
  'createdAt'
> & {
  createdAt: string;
  user: {
    maskedUser: string;
  };
  orderItem: {
    colorName: string | null;
    colorHex: string | null;
  };
  helpfulCount: number;
  currentUserVote: boolean | null;
  ProductReviewImage: Array<
    Pick<ProductReviewImage, 'id' | 'image_url' | 'blur_data_url' | 'order'>
  >;
};

export type ProductReviewsPayload = {
  items: ProductReviewListItem[];
  totalItems: number;
  summaryTotalItems: number;
  totalReviewImageCount: number;
  averageRating: number;
  ratingCounts: number[];
  totalPages: number;
  currentPage: number;
  perPage: number;
};

export type ProductReviewFeedbackSummary = {
  productReviewId: number;
  helpfulCount: number;
  currentUserVote: boolean | null;
};

export type ProductReviewGalleryImage = {
  id: number;
  productReviewId: number;
  image_url: string;
  blur_data_url: string | null;
  order: number;
  productReview: {
    id: number;
    rating: number;
    title: string;
    content: string;
    createdAt: string;
    helpfulCount: number;
    currentUserVote: boolean | null;
    reviewImages: {
      id: number;
      image_url: string;
      blur_data_url: string | null;
      order: number;
    }[];
    orderItem: {
      colorName: string | null;
      colorHex: string | null;
    };
    user: {
      maskedUser: string;
    };
  };
};

export type ProductReviewGalleryPageResponse = {
  items: ProductReviewGalleryImage[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type UpsertProductReviewFeedbackVariables = {
  productReviewId: number;
};
