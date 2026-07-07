import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { IconPhotoPlus, IconTrash, IconUpload } from '@tabler/icons-react';

import { uploadCloudinaryImage } from '@shared/lib/cloudinary/uploadImage';
import { TextInput, inputClass, labelClass } from '@shared/ui/AdminControls';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import type { AdminColor, ProductFormState } from '../model/types';

type ProductImageFormItem = ProductFormState['images'][number];

type AdminProductImageFieldsProps = {
  images: ProductFormState['images'];
  categoryId: string;
  productSlug: string;
  selectedFormColors: AdminColor[];
  onAddImage: () => void;
  onUpdateImage: (index: number, patch: Partial<ProductImageFormItem>) => void;
  onUpdateImageOrder: (index: number, value: string) => void;
  onRemoveImage: (index: number) => void;
};

export default function AdminProductImageFields({
  images,
  categoryId,
  productSlug,
  selectedFormColors,
  onAddImage,
  onUpdateImage,
  onUpdateImageOrder,
  onRemoveImage,
}: AdminProductImageFieldsProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleFileChange =
    (index: number, image: ProductImageFormItem) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      const parsedCategoryId = Number(categoryId);
      const parsedColorId = image.colorId ? Number(image.colorId) : null;

      if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
        setUploadError('상품 카테고리를 먼저 선택해주세요.');
        return;
      }

      if (!productSlug.trim()) {
        setUploadError('상품 슬러그를 먼저 입력해주세요.');
        return;
      }

      if (selectedFormColors.length > 0 && !image.colorId) {
        setUploadError(
          '색상이 있는 상품 이미지는 연결 색상을 먼저 선택해주세요.',
        );
        return;
      }

      try {
        setUploadingIndex(index);
        setUploadError(null);

        const uploaded = await uploadCloudinaryImage({
          file,
          target: {
            target: 'product',
            categoryId: parsedCategoryId,
            productSlug,
            colorId:
              parsedColorId && Number.isInteger(parsedColorId)
                ? parsedColorId
                : null,
          },
        });

        onUpdateImage(index, { image_url: uploaded.image_url });
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : '상품 이미지 업로드에 실패했습니다.',
        );
      } finally {
        setUploadingIndex(null);
      }
    };

  return (
    <fieldset className="grid gap-3 rounded-md border border-line p-3 dark:border-dark-border">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-medium text-ink dark:text-surface">
          상품 이미지
        </legend>
        <button
          type="button"
          onClick={onAddImage}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary dark:border-dark-border"
        >
          <IconPhotoPlus size={16} />
          이미지 추가
        </button>
      </div>
      <p className="text-xs leading-5 text-muted dark:text-dark-muted">
        색상이 있는 상품은 이미지마다 연결 색상을 선택합니다. 색상이 없는 상품만
        공통 이미지로 등록됩니다.
      </p>
      {uploadError ? (
        <p className="text-xs font-semibold text-danger">{uploadError}</p>
      ) : null}

      {images.length === 0 ? (
        <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-sm text-muted dark:border-dark-border dark:text-dark-muted">
          등록된 상품 이미지가 없습니다.
        </div>
      ) : (
        <div className="grid gap-3">
          {images.map((image, index) => (
            <div
              key={image.id ?? `new-image-${index}`}
              className="grid gap-3 rounded-md border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg"
            >
              <TextInput
                label={`이미지 URL ${index + 1}`}
                value={image.image_url}
                onChange={(value) => onUpdateImage(index, { image_url: value })}
              />
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 dark:border-dark-border">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                  disabled={uploadingIndex !== null}
                  onChange={handleFileChange(index, image)}
                  className="sr-only"
                />
                {uploadingIndex === index ? (
                  <Spinner size="sm" variant="current" />
                ) : (
                  <IconUpload size={16} />
                )}
                {uploadingIndex === index ? '업로드 중' : '파일 업로드'}
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px]">
                <label className={labelClass}>
                  연결 색상
                  <select
                    className={inputClass}
                    value={image.colorId}
                    required={selectedFormColors.length > 0}
                    onChange={(event) =>
                      onUpdateImage(index, {
                        colorId: event.target.value,
                      })
                    }
                  >
                    {selectedFormColors.length === 0 ? (
                      <option value="">공통 이미지</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          색상 선택
                        </option>
                        {selectedFormColors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </label>
                <TextInput
                  label="순서"
                  type="number"
                  value={image.order}
                  min={0}
                  onChange={(value) => onUpdateImageOrder(index, value)}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink dark:text-surface">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={image.isMain}
                    onChange={(event) =>
                      onUpdateImage(index, {
                        isMain: event.target.checked,
                      })
                    }
                  />
                  대표 이미지
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-danger transition hover:border-danger dark:border-dark-border"
                >
                  <IconTrash size={16} />
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
