import { useTranslations } from 'next-intl';

import { useReviewFormState } from '../../model/hooks/useReviewFormState';

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
  const {
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
  } = useReviewFormState({ productId, orderItemId, initialReview });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ReviewFormRatingField
        rating={formData.rating}
        hovered={hovered}
        onRatingChange={(rating) =>
          setFormData((prev) => ({ ...prev, rating }))
        }
        onHoverChange={setHovered}
      />

      <ReviewFormTextField
        id="title"
        label={t('title')}
        value={formData.title}
        error={errors.title}
        isBlurred={blurState.title}
        placeholder={t('titlePlaceholder')}
        maxLength={100}
        onChange={handleFieldChange}
        onBlur={handleBlur}
      />

      <ReviewFormTextField
        id="content"
        label={t('content')}
        value={formData.content}
        error={errors.content}
        isBlurred={blurState.content}
        placeholder={t('contentPlaceholder')}
        maxLength={1000}
        multiline
        onChange={handleFieldChange}
        onBlur={handleBlur}
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
