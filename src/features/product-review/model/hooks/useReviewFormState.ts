import { useState } from 'react';
import type { SubmitEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import { PRODUCT_REVIEW_ERROR_CODE } from '@shared/constants/productReviewErrorCode';
import { HttpError } from '@shared/lib/errors/httpError';
import { useRouter } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';

import { useUpsertProductReview } from '../../queries/useUpsertProductReview';
import {
  createInitialReviewFormData,
  createInitialReviewFormImages,
  reviewFormSchema,
} from '../reviewForm';

import useUploadImage from './useUploadImage';

import type { ReviewFormData, ReviewFormProps } from '../reviewForm';

export const useReviewFormState = ({
  productId,
  orderItemId,
  initialReview,
}: ReviewFormProps) => {
  const t = useTranslations('ReviewWrite');
  const { data: session } = useSession();
  const router = useRouter();
  const { isPending, mutateAsync } = useUpsertProductReview();
  const {
    selectedImages,
    isUploading,
    error: uploadError,
    addImages,
    uploadPendingImages,
    removeImage,
    clearSelectedImages,
  } = useUploadImage();
  const [hovered, setHovered] = useState<number | null>(null);
  const [existingImages, setExistingImages] = useState(() =>
    createInitialReviewFormImages(initialReview),
  );
  const {
    control,
    handleSubmit: submitForm,
    formState: { isDirty, isSubmitted },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: createInitialReviewFormData(initialReview),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const isEditing = initialReview?.id !== undefined;
  const totalImages = existingImages.length + selectedImages.length;
  const initialImages = createInitialReviewFormImages(initialReview);
  const hasImageChanges =
    selectedImages.length > 0 ||
    existingImages.length !== initialImages.length ||
    existingImages.some(
      (image, index) =>
        image.image_url !== initialImages[index]?.image_url ||
        image.order !== initialImages[index]?.order,
    );

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async (formData: ReviewFormData) => {
    try {
      const uploadedImages = await uploadPendingImages({
        target: 'review',
        orderItemId,
      });
      const finalImages = [
        ...existingImages.map((img, idx) => ({
          image_url: img.image_url,
          blur_data_url: img.blur_data_url ?? null,
          order: idx,
        })),
        ...uploadedImages.map((image, idx) => ({
          image_url: image.image_url,
          order: existingImages.length + idx,
        })),
      ];

      await mutateAsync({
        productId,
        orderItemId,
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        images: finalImages,
      });

      toast.success(isEditing ? t('toast.updated') : t('toast.created'));
      clearSelectedImages();
      router.push(MY_TAB_PATHS.orders);
    } catch (error) {
      const uploadErrorMessage =
        error instanceof Error ? error.message : uploadError;
      const isUploadFailure =
        typeof uploadErrorMessage === 'string' &&
        (uploadErrorMessage === uploadError ||
          uploadErrorMessage.includes('Upload') ||
          uploadErrorMessage.includes('Image upload') ||
          uploadErrorMessage.includes('API v1 key'));

      if (isUploadFailure) {
        toast.error(t('toast.uploadFailed', { message: uploadErrorMessage }));
        return;
      }

      if (
        error instanceof HttpError &&
        error.code === PRODUCT_REVIEW_ERROR_CODE.HIDDEN_REVIEW_EDIT_FORBIDDEN
      ) {
        toast.error(t('toast.hiddenReviewError'));
        return;
      }

      toast.error(
        isEditing ? t('toast.updateFailed') : t('toast.createFailed'),
      );
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    if (!session?.user.id) {
      event.preventDefault();
      toast.error(t('toast.loginRequired'));
      router.push('/login');
      return;
    }

    await submitForm(submitReview)(event);
  };

  const handleCancel = () => {
    if (!isDirty && !hasImageChanges) {
      router.back();
      return;
    }

    const shouldLeave = window.confirm(t('toast.leaveConfirm'));

    if (shouldLeave) {
      router.back();
    }
  };

  return {
    control,
    hovered,
    existingImages,
    selectedImages,
    totalImages,
    isSubmitted,
    isEditing,
    isPending,
    isUploading,
    uploadError,
    setHovered,
    handleSubmit,
    handleCancel,
    addImages,
    handleRemoveExistingImage,
    removeImage,
  };
};
