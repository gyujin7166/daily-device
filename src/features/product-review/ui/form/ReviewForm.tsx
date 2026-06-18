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
        label="제목"
        value={formData.title}
        error={errors.title}
        isBlurred={blurState.title}
        placeholder="몇 마디로 경험을 요약해 주세요"
        maxLength={100}
        onChange={handleFieldChange}
        onBlur={handleBlur}
      />

      <ReviewFormTextField
        id="content"
        label="내용"
        value={formData.content}
        error={errors.content}
        isBlurred={blurState.content}
        placeholder="어떤 점이 좋았나요? 아쉬웠던 점은 무엇인가요?"
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
