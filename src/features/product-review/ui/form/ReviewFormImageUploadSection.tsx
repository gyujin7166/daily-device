import type { ChangeEvent } from 'react';

import Image from 'next/image';

import { IconCamera, IconLoader2, IconX } from '@tabler/icons-react';

import { MAX_REVIEW_IMAGES } from '@entities/review/model/constants';

import { CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB } from '@shared/lib/cloudinary/uploadImage';
import { getCloudinaryReviewImageUrl } from '@shared/lib/utils/cloudinaryImage';

import ReviewFormSection from './ReviewFormSection';

type ExistingImage = {
  image_url: string;
  order: number;
};

type SelectedImage = {
  id: string;
  previewUrl: string;
};

type ReviewFormImageUploadSectionProps = {
  existingImages: ExistingImage[];
  selectedImages: SelectedImage[];
  totalImages: number;
  isUploading: boolean;
  uploadError: string | null;
  onAddImages: (params: {
    files: File[];
    remainingImageCount: number;
  }) => Promise<void>;
  onRemoveExistingImage: (index: number) => void;
  onRemoveSelectedImage: (index: number) => void;
};

export default function ReviewFormImageUploadSection({
  existingImages,
  selectedImages,
  totalImages,
  isUploading,
  uploadError,
  onAddImages,
  onRemoveExistingImage,
  onRemoveSelectedImage,
}: ReviewFormImageUploadSectionProps) {
  const canAddImage = totalImages < MAX_REVIEW_IMAGES;
  const remainingImageCount = MAX_REVIEW_IMAGES - totalImages;
  const isUploadDisabled = !canAddImage || isUploading;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    void onAddImages({
      files,
      remainingImageCount,
    });
  };

  return (
    <ReviewFormSection label="사진 첨부" optional>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {existingImages.map((img, index) => (
            <div key={`existing-${index}`} className="relative aspect-square">
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg">
                <Image
                  src={getCloudinaryReviewImageUrl(img.image_url, 'preview')}
                  alt={`기존 이미지 ${index + 1}`}
                  width={200}
                  height={200}
                  className="h-full w-full select-none object-cover"
                  draggable={false}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveExistingImage(index)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface shadow-sm transition-transform hover:scale-110 dark:bg-surface dark:text-ink"
                aria-label="이미지 삭제"
              >
                <IconX size={10} stroke={2.5} />
              </button>
            </div>
          ))}

          {selectedImages.map((img, index) => (
            <div key={img.id} className="relative aspect-square">
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg">
                <Image
                  src={img.previewUrl}
                  alt={`새 이미지 ${index + 1}`}
                  width={200}
                  height={200}
                  unoptimized
                  className="h-full w-full select-none object-cover"
                  draggable={false}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveSelectedImage(index)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface shadow-sm transition-transform hover:scale-110 dark:bg-surface dark:text-ink"
                aria-label="이미지 삭제"
              >
                <IconX size={10} stroke={2.5} />
              </button>
            </div>
          ))}

          {canAddImage ? (
            <label
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line bg-canvas text-muted transition-colors hover:border-primary hover:text-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 dark:border-dark-border dark:bg-dark-bg dark:text-dark-muted dark:hover:border-primary dark:hover:text-primary"
              aria-disabled={isUploadDisabled}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                disabled={isUploadDisabled}
                onChange={handleFileChange}
                className="sr-only"
              />
              {isUploading ? (
                <IconLoader2 size={22} className="animate-spin" stroke={1.5} />
              ) : (
                <IconCamera size={22} stroke={1.5} />
              )}
              <span className="text-[10px] font-medium tracking-wide">
                {isUploading ? '업로드 중' : '이미지 추가'}
              </span>
            </label>
          ) : null}
        </div>

        {uploadError ? (
          <span className="inline-block text-xs font-semibold text-danger">
            {uploadError}
          </span>
        ) : null}

        <p className="text-[11px] italic text-disabled-text dark:text-dark-muted">
          이미지는 최대 {MAX_REVIEW_IMAGES}개, 파일당{' '}
          {CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB}MB까지 업로드할 수 있습니다.
        </p>
      </div>
    </ReviewFormSection>
  );
}
