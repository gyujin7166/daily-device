import type { AdminPageResult } from '@shared/api/adminApi';

export type AdminReviewStatus = 'all' | 'visible' | 'hidden';

export type AdminReview = {
  id: number;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  adminHiddenAt: string | null;
  product: {
    id: number;
    name_ko: string | null;
    name_en: string;
    slug: string;
    translations: Array<{
      locale: string;
      name: string;
    }>;
  };
  orderItem: {
    colorName: string | null;
    colorHex: string | null;
    colorTranslations: Array<{
      locale: string;
      name: string;
    }>;
  };
  user: {
    name: string | null;
    email: string | null;
  };
  images: Array<{
    id: number;
    image_url: string;
    order: number;
  }>;
};

type AdminReviewSummary = {
  total: number;
  visible: number;
  hidden: number;
};

export type AdminReviewPayload = {
  reviews: AdminPageResult<AdminReview>;
  summary: AdminReviewSummary;
};

export type AdminReviewListParams = {
  page: number;
  limit: number;
  keyword: string;
  status: AdminReviewStatus;
};
