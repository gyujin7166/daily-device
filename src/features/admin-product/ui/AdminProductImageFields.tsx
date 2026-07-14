import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { IconPhotoPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import {
  CloudinaryUploadError,
  cloudinaryUploadErrorKeyByCode,
  uploadCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';
import { TextInput, inputClass, labelClass } from '@shared/ui/AdminControls';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import type { AdminColor, ProductFormState } from '../model/types';

type ProductImageFormItem = ProductFormState['images'][number];

type AdminProductImageFieldsProps = {
  images: ProductFormState['images'];
  categoryId: string;
  productSlug: string;
  selectedFormColors: AdminColor[];
  locale: string;
  onAddImage: () => void;
  onUpdateImage: (index: number, patch: Partial<ProductImageFormItem>) => void;
  onUpdateImageOrder: (index: number, value: string) => void;
  onRemoveImage: (index: number) => void;
};

const getLocalizedColorName = (color: AdminColor, locale: string) =>
  color.translations.find((translation) => translation.locale === locale)
    ?.name ?? color.name;

const getUploadErrorMessage = (
  error: unknown,
  t: ReturnType<typeof useTranslations<'AdminProduct.images'>>,
) => {
  if (error instanceof CloudinaryUploadError) {
    const key = cloudinaryUploadErrorKeyByCode[error.code];

    return t(`uploadErrors.${key}`, { maxSize: error.details ?? '' });
  }

  return error instanceof Error ? error.message : t('uploadFailed');
};

export default function AdminProductImageFields({
  images,
  categoryId,
  productSlug,
  selectedFormColors,
  locale,
  onAddImage,
  onUpdateImage,
  onUpdateImageOrder,
  onRemoveImage,
}: AdminProductImageFieldsProps) {
  const t = useTranslations('AdminProduct.images');
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
        setUploadError(t('categoryRequired'));
        return;
      }

      if (!productSlug.trim()) {
        setUploadError(t('slugRequired'));
        return;
      }

      if (selectedFormColors.length > 0 && !image.colorId) {
        setUploadError(t('colorRequired'));
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
        setUploadError(getUploadErrorMessage(error, t));
      } finally {
        setUploadingIndex(null);
      }
    };

  return (
    <fieldset className="grid gap-3 rounded-md border border-line p-3 dark:border-dark-border">
      <div className="flex items-center justify-between gap-3">
        <legend className="text-sm font-medium text-ink dark:text-surface">
          {t('title')}
        </legend>
        <button
          type="button"
          onClick={onAddImage}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary dark:border-dark-border"
        >
          <IconPhotoPlus size={16} />
          {t('add')}
        </button>
      </div>
      <p className="text-xs leading-5 text-muted dark:text-dark-muted">
        {t('guide')}
      </p>
      {uploadError ? (
        <p className="text-xs font-semibold text-danger">{uploadError}</p>
      ) : null}

      {images.length === 0 ? (
        <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-sm text-muted dark:border-dark-border dark:text-dark-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="grid gap-3">
          {images.map((image, index) => (
            <div
              key={image.id ?? `new-image-${index}`}
              className="grid gap-3 rounded-md border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg"
            >
              <TextInput
                label={t('urlLabel', { index: index + 1 })}
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
                {uploadingIndex === index ? t('uploading') : t('upload')}
              </label>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px]">
                <label className={labelClass}>
                  {t('linkedColor')}
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
                      <option value="">{t('commonImage')}</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          {t('selectColor')}
                        </option>
                        {selectedFormColors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {getLocalizedColorName(color, locale)}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </label>
                <TextInput
                  label={t('order')}
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
                  {t('main')}
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-danger transition hover:border-danger dark:border-dark-border"
                >
                  <IconTrash size={16} />
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}
