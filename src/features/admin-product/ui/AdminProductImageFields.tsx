import { useState } from 'react';
import type { ChangeEvent } from 'react';

import { IconPhotoPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import {
  CloudinaryUploadError,
  cloudinaryUploadErrorKeyByCode,
  uploadCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';
import { inputClass, labelClass } from '@shared/ui/AdminControls';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import type { AdminColor, ProductFormState } from '../model/types';
import type {
  FieldArrayWithId,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';

type AdminProductImageFieldsProps = {
  fields: FieldArrayWithId<ProductFormState, 'images', 'fieldKey'>[];
  selectedFormColors: AdminColor[];
  locale: string;
  getValues: UseFormGetValues<ProductFormState>;
  register: UseFormRegister<ProductFormState>;
  setValue: UseFormSetValue<ProductFormState>;
  onAddImage: () => void;
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

const normalizeImageOrder = (value: string) => {
  const parsedValue = Number(value);

  if (value === '' || !Number.isFinite(parsedValue)) {
    return '';
  }

  return String(Math.max(0, Math.floor(parsedValue)));
};

export default function AdminProductImageFields({
  fields,
  selectedFormColors,
  locale,
  getValues,
  register,
  setValue,
  onAddImage,
  onRemoveImage,
}: AdminProductImageFieldsProps) {
  const t = useTranslations('AdminProduct.images');
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const handleFileChange =
    (index: number) => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file) {
        return;
      }

      const parsedCategoryId = Number(getValues('categoryId'));
      const productSlug = getValues('slug');
      const colorId = getValues(`images.${index}.colorId`);
      const parsedColorId = colorId ? Number(colorId) : null;

      if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
        setUploadError(t('categoryRequired'));
        return;
      }

      if (!productSlug.trim()) {
        setUploadError(t('slugRequired'));
        return;
      }

      if (selectedFormColors.length > 0 && !colorId) {
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

        setValue(`images.${index}.image_url`, uploaded.image_url, {
          shouldDirty: true,
          shouldValidate: true,
        });
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

      {fields.length === 0 ? (
        <div className="rounded-md border border-dashed border-line px-3 py-6 text-center text-sm text-muted dark:border-dark-border dark:text-dark-muted">
          {t('empty')}
        </div>
      ) : (
        <div className="grid gap-3">
          {fields.map((field, index) => {
            const orderRegistration = register(`images.${index}.order`);

            return (
              <div
                key={field.fieldKey}
                className="grid gap-3 rounded-md border border-line bg-canvas p-3 dark:border-dark-border dark:bg-dark-bg"
              >
                <input type="hidden" {...register(`images.${index}.id`)} />
                <label className={labelClass}>
                  {t('urlLabel', { index: index + 1 })}
                  <input
                    className={inputClass}
                    {...register(`images.${index}.image_url`)}
                  />
                </label>
                <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 dark:border-dark-border">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                    disabled={uploadingIndex !== null}
                    onChange={handleFileChange(index)}
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
                      {...register(`images.${index}.colorId`)}
                      required={selectedFormColors.length > 0}
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
                  <label className={labelClass}>
                    {t('order')}
                    <input
                      {...orderRegistration}
                      type="number"
                      min={0}
                      className={inputClass}
                      onChange={(event) => {
                        event.target.value = normalizeImageOrder(
                          event.target.value,
                        );
                        void orderRegistration.onChange(event);
                      }}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink dark:text-surface">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      {...register(`images.${index}.isMain`)}
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
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
