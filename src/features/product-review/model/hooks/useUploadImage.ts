import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  assertValidCloudinaryImageFile,
  CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB,
  CloudinaryUploadError,
  cloudinaryUploadErrorKeyByCode,
  uploadCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';
import type {
  CloudinaryUploadTarget,
  UploadedCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

const getUploadErrorMessage = (
  error: unknown,
  t: ReturnType<typeof useTranslations<'ReviewWrite.upload'>>,
) => {
  if (error instanceof CloudinaryUploadError) {
    const key = cloudinaryUploadErrorKeyByCode[error.code];

    return t(`uploadErrors.${key}`, { maxSize: error.details ?? '' });
  }

  return error instanceof Error ? error.message : t('uploadFailed');
};

export default function useUploadImage() {
  const t = useTranslations('ReviewWrite.upload');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
    };
  }, []);

  const addImages = async ({
    files,
    remainingImageCount,
  }: {
    files: File[];
    remainingImageCount: number;
  }) => {
    const filesToSelect = files.slice(0, remainingImageCount);

    if (filesToSelect.length === 0) {
      return;
    }

    try {
      filesToSelect.forEach((file) =>
        assertValidCloudinaryImageFile(
          file,
          CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB,
        ),
      );
      setError(null);

      setSelectedImages((prev) => [
        ...prev,
        ...filesToSelect.map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    } catch (selectError) {
      setError(getUploadErrorMessage(selectError, t));
    }
  };

  const uploadPendingImages = async (
    target: CloudinaryUploadTarget,
  ): Promise<UploadedCloudinaryImage[]> => {
    if (selectedImages.length === 0) {
      return [];
    }

    try {
      selectedImages.forEach((image) =>
        assertValidCloudinaryImageFile(
          image.file,
          CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB,
        ),
      );
      setIsUploading(true);
      setError(null);

      return await Promise.all(
        selectedImages.map((image) =>
          uploadCloudinaryImage({
            file: image.file,
            target,
          }),
        ),
      );
    } catch (uploadError) {
      const message = getUploadErrorMessage(uploadError, t);

      setError(t('uploadFailedWithMessage', { message }));
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const clearSelectedImages = () => {
    selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setSelectedImages([]);
  };

  return {
    selectedImages,
    isUploading,
    error,
    addImages,
    uploadPendingImages,
    removeImage,
    clearSelectedImages,
  };
}
