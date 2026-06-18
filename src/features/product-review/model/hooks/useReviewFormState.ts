import { useState } from 'react';
import type { ChangeEvent, FocusEvent, SubmitEvent } from 'react';

import { useRouter } from 'next/navigation';

import { useSession } from 'next-auth/react';

import { MY_TAB_PATHS } from '@shared/constants/myRoutes';
import { toast } from '@shared/lib/toast';

import { useUpsertProductReview } from '../../queries/useUpsertProductReview';
import {
  createInitialReviewFormData,
  createInitialReviewFormImages,
  getReviewFormFieldError,
  isReviewFormFieldName,
  validateReviewForm,
  validateReviewFormField,
} from '../reviewForm';

import useUploadImage from './useUploadImage';

import type { ReviewFormBlurState, ReviewFormProps } from '../reviewForm';

export const useReviewFormState = ({
  productId,
  orderItemId,
  initialReview,
}: ReviewFormProps) => {
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
  const [formData, setFormData] = useState(() =>
    createInitialReviewFormData(initialReview),
  );
  const [existingImages, setExistingImages] = useState(() =>
    createInitialReviewFormImages(initialReview),
  );
  const [blurState, setBlurState] = useState<ReviewFormBlurState>({
    title: false,
    content: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = initialReview?.id !== undefined;
  const totalImages = existingImages.length + selectedImages.length;
  const initialFormData = createInitialReviewFormData(initialReview);
  const initialImages = createInitialReviewFormImages(initialReview);
  const hasFormChanges =
    formData.rating !== initialFormData.rating ||
    formData.title !== initialFormData.title ||
    formData.content !== initialFormData.content ||
    selectedImages.length > 0 ||
    existingImages.length !== initialImages.length ||
    existingImages.some(
      (image, index) =>
        image.image_url !== initialImages[index]?.image_url ||
        image.order !== initialImages[index]?.order,
    );

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    if (!isReviewFormFieldName(name)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (blurState[name] && validateReviewFormField(name, value)) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    if (!isReviewFormFieldName(name)) {
      return;
    }

    setBlurState((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: getReviewFormFieldError(name, value),
    }));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.user.id) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const validationResult = validateReviewForm(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setBlurState({ title: true, content: true });
      return;
    }

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

      toast.success(
        isEditing ? '상품평이 수정되었습니다.' : '상품평이 등록되었습니다.',
      );
      clearSelectedImages();
      router.push(MY_TAB_PATHS.orders);
    } catch (error) {
      const uploadErrorMessage =
        error instanceof Error ? error.message : uploadError;
      const isUploadFailure =
        typeof uploadErrorMessage === 'string' &&
        (uploadErrorMessage.includes('업로드') ||
          uploadErrorMessage.includes('Upload') ||
          uploadErrorMessage.includes('API v1 key'));

      if (isUploadFailure) {
        toast.error(`이미지 업로드 실패: ${uploadErrorMessage}`);
        return;
      }

      if (
        error instanceof Error &&
        error.message.includes('비공개 처리된 상품평')
      ) {
        toast.error(error.message);
        return;
      }

      toast.error(
        isEditing
          ? '상품평 수정에 실패했습니다. 다시 시도해주세요.'
          : '상품평 등록에 실패했습니다. 다시 시도해주세요.',
      );
    }
  };

  const handleCancel = () => {
    if (!hasFormChanges) {
      router.back();
      return;
    }

    const shouldLeave = window.confirm(
      '작성 중인 내용이 사라집니다. 페이지를 나가시겠습니까?',
    );

    if (shouldLeave) {
      router.back();
    }
  };

  return {
    formData,
    hovered,
    existingImages,
    selectedImages,
    totalImages,
    blurState,
    errors,
    isEditing,
    isPending,
    isUploading,
    uploadError,
    setHovered,
    setFormData,
    handleSubmit,
    handleCancel,
    handleFieldChange,
    handleBlur,
    addImages,
    handleRemoveExistingImage,
    removeImage,
  };
};
