import type { ProductReviewEditItem } from '@entities/review/model/types';

type ReviewFormData = {
  rating: number;
  title: string;
  content: string;
};

export type ReviewFormBlurState = {
  title: boolean;
  content: boolean;
};

export type ReviewFormErrorKey =
  | 'titleRequired'
  | 'titleMin'
  | 'contentRequired'
  | 'contentMin';

type ReviewFormErrors = Partial<
  Record<keyof ReviewFormBlurState, ReviewFormErrorKey>
>;

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

export const validateReviewFormField = (
  name: keyof ReviewFormBlurState,
  value: string,
) => {
  if (name === 'title') {
    return value.trim().length >= 2;
  }

  if (name === 'content') {
    return value.trim().length >= 10;
  }

  return true;
};

export const getReviewFormFieldError = (
  name: keyof ReviewFormBlurState,
  value: string,
) => {
  if (name === 'title') {
    if (!value.trim()) {
      return 'titleRequired';
    }

    if (value.trim().length < 2) {
      return 'titleMin';
    }
  }

  if (name === 'content') {
    if (!value.trim()) {
      return 'contentRequired';
    }

    if (value.trim().length < 10) {
      return 'contentMin';
    }
  }

  return '';
};

export const isReviewFormFieldName = (
  value: string,
): value is keyof ReviewFormBlurState =>
  value === 'title' || value === 'content';

export const validateReviewForm = (formData: ReviewFormData) => {
  const visibleErrors: ReviewFormErrors = {};
  const titleError = getReviewFormFieldError('title', formData.title);
  const contentError = getReviewFormFieldError('content', formData.content);

  if (titleError) {
    visibleErrors.title = titleError;
  }

  if (contentError) {
    visibleErrors.content = contentError;
  }

  return {
    errors: visibleErrors,
    isValid: Object.keys(visibleErrors).length === 0,
  };
};
