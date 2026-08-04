import { z } from 'zod';

import type { ProductReviewEditItem } from '@entities/review/model/types';

export type ReviewFormErrorKey =
  | 'titleRequired'
  | 'titleMin'
  | 'contentRequired'
  | 'contentMin';

type ReviewFormExistingImage = {
  image_url: string;
  blur_data_url?: string | null;
  order: number;
};

export type ReviewFormProps = {
  productId: number;
  orderItemId: number;
  initialReview: ProductReviewEditItem | null;
};

const titleSchema = z.string().superRefine((value, context) => {
  const length = value.trim().length;

  if (length === 0) {
    context.addIssue({ code: 'custom', message: 'titleRequired' });
    return;
  }

  if (length < 2) {
    context.addIssue({ code: 'custom', message: 'titleMin' });
  }
});

const contentSchema = z.string().superRefine((value, context) => {
  const length = value.trim().length;

  if (length === 0) {
    context.addIssue({ code: 'custom', message: 'contentRequired' });
    return;
  }

  if (length < 10) {
    context.addIssue({ code: 'custom', message: 'contentMin' });
  }
});

export const reviewFormSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: titleSchema,
  content: contentSchema,
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;

export const createInitialReviewFormData = (
  initialReview: ProductReviewEditItem | null,
): ReviewFormData => ({
  rating: initialReview?.rating ?? 5,
  title: initialReview?.title ?? '',
  content: initialReview?.content ?? '',
});

export const createInitialReviewFormImages = (
  initialReview: ProductReviewEditItem | null,
): ReviewFormExistingImage[] => initialReview?.ProductReviewImage ?? [];

export const isReviewFormErrorKey = (
  value: unknown,
): value is ReviewFormErrorKey =>
  value === 'titleRequired' ||
  value === 'titleMin' ||
  value === 'contentRequired' ||
  value === 'contentMin';
