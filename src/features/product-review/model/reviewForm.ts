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

type ReviewFormErrors = Partial<Record<keyof ReviewFormBlurState, string>>;

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
      return '제목을 입력해주세요.';
    }

    if (value.trim().length < 2) {
      return '최소 2글자 이상 입력해주세요.';
    }
  }

  if (name === 'content') {
    if (!value.trim()) {
      return '내용을 입력해주세요.';
    }

    if (value.trim().length < 10) {
      return '최소 10글자 이상 입력해주세요.';
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
