import type { ChangeEvent } from 'react';

import Image from 'next/image';

import { IconCamera, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { MAX_REVIEW_IMAGES } from '@entities/review/model/constants';

import { CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB } from '@shared/lib/cloudinary/uploadImage';
import {
  getCloudinaryReviewImageUrl,
  isCloudinaryImageUrl,
} from '@shared/lib/utils/cloudinaryImage';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

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
  const t = useTranslations('ReviewWrite.form');
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
    <ReviewFormSection label={t('imageUpload')} optional>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {existingImages.map((img, index) => (
            <div key={`existing-${index}`} className="relative aspect-square">
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-line bg-canvas dark:border-dark-border dark:bg-dark-bg">
                <Image
                  src={getCloudinaryReviewImageUrl(img.image_url, 'preview')}
                  alt={t('existingImageAlt', { index: index + 1 })}
                  width={200}
                  height={200}
                  unoptimized={isCloudinaryImageUrl(img.image_url)}
                  className="h-full w-full select-none object-cover"
                  draggable={false}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveExistingImage(index)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-surface shadow-sm transition-transform hover:scale-110 dark:bg-surface dark:text-ink"
                aria-label={t('removeImage')}
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
                  alt={t('newImageAlt', { index: index + 1 })}
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
                aria-label={t('removeImage')}
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
                <Spinner size="md" variant="current" className="size-5.5" />
              ) : (
                <IconCamera size={22} stroke={1.5} />
              )}
              <span className="text-[10px] font-medium tracking-wide">
                {isUploading ? t('uploading') : t('addImage')}
              </span>
            </label>
          ) : null}
        </div>

        {uploadError ? (
          <span className="inline-block text-xs font-semibold text-danger">
            {uploadError}
          </span>
        ) : null}

        <p className="text-[11px] italic text-muted dark:text-dark-muted">
          {t('uploadGuide', {
            maxCount: MAX_REVIEW_IMAGES,
            maxSize: CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB,
          })}
        </p>
      </div>
    </ReviewFormSection>
  );
}
