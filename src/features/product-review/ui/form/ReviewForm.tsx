import { useTranslations } from 'next-intl';
import { Controller } from 'react-hook-form';

import { useReviewFormState } from '../../model/hooks/useReviewFormState';
import { isReviewFormErrorKey } from '../../model/reviewForm';

import ReviewFormActions from './ReviewFormActions';
import ReviewFormImageUploadSection from './ReviewFormImageUploadSection';
import ReviewFormRatingField from './ReviewFormRatingField';
import ReviewFormTextField from './ReviewFormTextField';

import type { ReviewFormProps } from '../../model/reviewForm';

export default function ReviewForm({
  productId,
  orderItemId,
  initialReview,
}: ReviewFormProps) {
  const t = useTranslations('ReviewWrite.form');
  const tValidation = useTranslations('ReviewWrite.validation');
  const {
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
  } = useReviewFormState({ productId, orderItemId, initialReview });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <ReviewFormRatingField
            rating={field.value}
            hovered={hovered}
            onRatingChange={field.onChange}
            onHoverChange={setHovered}
          />
        )}
      />

      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <ReviewFormTextField
            id="title"
            label={t('title')}
            value={field.value}
            error={
              isReviewFormErrorKey(fieldState.error?.message)
                ? tValidation(fieldState.error.message)
                : undefined
            }
            isBlurred={fieldState.isTouched || isSubmitted}
            placeholder={t('titlePlaceholder')}
            maxLength={100}
            inputRef={field.ref}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <Controller
        name="content"
        control={control}
        render={({ field, fieldState }) => (
          <ReviewFormTextField
            id="content"
            label={t('content')}
            value={field.value}
            error={
              isReviewFormErrorKey(fieldState.error?.message)
                ? tValidation(fieldState.error.message)
                : undefined
            }
            isBlurred={fieldState.isTouched || isSubmitted}
            placeholder={t('contentPlaceholder')}
            maxLength={1000}
            multiline
            inputRef={field.ref}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <ReviewFormImageUploadSection
        existingImages={existingImages}
        selectedImages={selectedImages}
        totalImages={totalImages}
        isUploading={isUploading}
        uploadError={uploadError}
        onAddImages={addImages}
        onRemoveExistingImage={handleRemoveExistingImage}
        onRemoveSelectedImage={removeImage}
      />

      <ReviewFormActions
        isEditing={isEditing}
        isPending={isPending}
        isUploading={isUploading}
        onCancel={handleCancel}
      />
    </form>
  );
}
