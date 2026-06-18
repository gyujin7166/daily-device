import { useEffect, useRef, useState } from 'react';

import {
  assertValidCloudinaryImageFile,
  CLOUDINARY_REVIEW_UPLOAD_MAX_SIZE_MB,
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

export default function useUploadImage() {
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
      const message =
        selectError instanceof Error
          ? selectError.message
          : '이미지 선택 중 오류가 발생했습니다.';

      setError(message);
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
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : '이미지 업로드 중 오류가 발생했습니다.';

      setError(`이미지 업로드 실패: ${message}`);
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
