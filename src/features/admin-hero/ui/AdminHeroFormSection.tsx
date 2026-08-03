import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { SubmitEvent } from 'react';

import { IconDeviceFloppy, IconPlus, IconUpload } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  CloudinaryUploadError,
  cloudinaryUploadErrorKeyByCode,
  uploadCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';
import { getCategoryHref } from '@shared/lib/routes/productRoutes';
import {
  SectionTitle,
  TextArea,
  TextInput,
  inputClass,
  labelClass,
} from '@shared/ui/AdminControls';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import { getAdminHeroTypeLabelKey } from '../model/types';

import type {
  AdminHeroCategory,
  AdminHeroType,
  HeroOverlayTone,
  HeroPosition,
  HeroTranslationLocale,
  HeroTone,
  HeroFormState,
} from '../model/types';

const HERO_POSITION_OPTIONS: Array<{
  labelKey: 'start' | 'center' | 'end';
  value: HeroPosition;
}> = [
  { labelKey: 'start', value: 'start' },
  { labelKey: 'center', value: 'center' },
  { labelKey: 'end', value: 'end' },
];

const HERO_TONE_OPTIONS: Array<{
  labelKey: 'light' | 'dark';
  value: HeroTone;
}> = [
  { labelKey: 'light', value: 'light' },
  { labelKey: 'dark', value: 'dark' },
];

const HERO_OVERLAY_TONE_OPTIONS: Array<{
  labelKey: 'none' | 'dark' | 'light';
  value: HeroOverlayTone;
}> = [
  { labelKey: 'none', value: 'none' },
  { labelKey: 'dark', value: 'dark' },
  { labelKey: 'light', value: 'light' },
];

const getLocalizedCategoryName = (
  category: Pick<AdminHeroCategory, 'name_en' | 'name_ko'>,
  locale: string,
) =>
  (locale === 'en' ? category.name_en : category.name_ko) || category.name_en;

const getUploadErrorMessage = (
  error: unknown,
  t: ReturnType<typeof useTranslations<'AdminHero'>>,
) => {
  if (error instanceof CloudinaryUploadError) {
    const key = cloudinaryUploadErrorKeyByCode[error.code];

    return t(`form.uploadErrors.${key}`, { maxSize: error.details ?? '' });
  }

  return error instanceof Error ? error.message : t('form.uploadFailed');
};

type AdminHeroFormSectionProps = {
  form: HeroFormState;
  heroTypes: AdminHeroType[];
  categories: AdminHeroCategory[];
  selectedHeroType?: AdminHeroType;
  selectedTargetCategory?: AdminHeroCategory;
  isProductHero: boolean;
  isSaving: boolean;
  setForm: Dispatch<SetStateAction<HeroFormState>>;
  onReset: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onHeroTypeChange: (heroTypeId: string) => void;
  onTargetCategoryChange: (targetCategoryId: string) => void;
  isHeroTypeDisabled: (heroType: AdminHeroType) => boolean;
};

export default function AdminHeroFormSection({
  form,
  heroTypes,
  categories,
  selectedHeroType,
  selectedTargetCategory,
  isProductHero,
  isSaving,
  setForm,
  onReset,
  onSubmit,
  onHeroTypeChange,
  onTargetCategoryChange,
  isHeroTypeDisabled,
}: AdminHeroFormSectionProps) {
  const locale = useLocale();
  const activeTranslationLocale: HeroTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const t = useTranslations('AdminHero');
  const getHeroTypeLabel = (name: string) => {
    const labelKey = getAdminHeroTypeLabelKey(name);

    return labelKey ? t(labelKey) : name;
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const selectedHeroPath =
    selectedHeroType?.name === 'main'
      ? '/'
      : selectedHeroType?.name === 'product-all'
        ? '/products'
        : selectedHeroType?.name === 'product-discounts'
          ? '/products/discounts'
          : null;
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const parsedHeroTypeId = Number(form.heroTypeId);
    if (!Number.isInteger(parsedHeroTypeId) || parsedHeroTypeId <= 0) {
      setUploadError(t('form.typeRequired'));
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const uploaded = await uploadCloudinaryImage({
        file,
        target: {
          target: 'hero',
          heroTypeId: parsedHeroTypeId,
        },
      });

      setForm((prev) => ({ ...prev, image_url: uploaded.image_url }));
    } catch (error) {
      setUploadError(getUploadErrorMessage(error, t));
    } finally {
      setIsUploading(false);
    }
  };
  const updateTranslationField = (
    field: 'name' | 'description' | 'detailed_description',
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      ...(field === 'name' && activeTranslationLocale === 'en'
        ? { name_en: value }
        : {}),
      ...(field === 'name' && activeTranslationLocale === 'ko'
        ? { name_ko: value }
        : {}),
      ...(field === 'description' && activeTranslationLocale === 'ko'
        ? { description: value }
        : {}),
      ...(field === 'detailed_description' && activeTranslationLocale === 'ko'
        ? { detailed_description: value }
        : {}),
      translations: {
        ...prev.translations,
        [activeTranslationLocale]: {
          ...prev.translations[activeTranslationLocale],
          [field]: value,
        },
      },
    }));
  };
  const activeTranslation = form.translations[activeTranslationLocale];

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title={form.id ? t('form.editTitle') : t('form.createTitle')}
        action={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconPlus size={16} />
            {t('form.new')}
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <label className={labelClass}>
          {t('form.type')}
          <select
            className={inputClass}
            value={form.heroTypeId}
            onChange={(event) => onHeroTypeChange(event.target.value)}
            required
          >
            {heroTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
                disabled={isHeroTypeDisabled(type)}
              >
                {getHeroTypeLabel(type.name)}
                {isHeroTypeDisabled(type) ? t('form.disabledSuffix') : ''}
              </option>
            ))}
          </select>
          {selectedHeroPath ? (
            <span className="text-xs font-normal text-muted dark:text-dark-muted">
              {t('form.pathPreview', { path: selectedHeroPath })}
            </span>
          ) : null}
        </label>
        {isProductHero ? (
          <label className={labelClass}>
            {t('form.targetCategory')}
            <select
              className={inputClass}
              value={form.targetCategoryId}
              onChange={(event) => onTargetCategoryChange(event.target.value)}
              required
            >
              <option value="">{t('form.selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {getLocalizedCategoryName(category, locale)} ({category.slug})
                </option>
              ))}
            </select>
            {selectedTargetCategory ? (
              <span className="text-xs font-normal text-muted dark:text-dark-muted">
                {t('form.pathPreview', {
                  path: getCategoryHref(selectedTargetCategory.slug),
                })}
              </span>
            ) : null}
          </label>
        ) : null}
        <TextInput
          label={
            activeTranslationLocale === 'en'
              ? t('form.nameEn')
              : t('form.nameKo')
          }
          value={activeTranslation.name}
          onChange={(value) => updateTranslationField('name', value)}
          required
        />
        <TextInput
          label={t('form.imageUrl')}
          value={form.image_url}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, image_url: value }))
          }
        />
        <div className="grid gap-1.5">
          <label className="inline-flex h-9 w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 dark:border-dark-border">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              disabled={isUploading}
              onChange={handleFileChange}
              className="sr-only"
            />
            {isUploading ? (
              <Spinner size="sm" variant="current" />
            ) : (
              <IconUpload size={16} />
            )}
            {isUploading ? t('form.uploading') : t('form.upload')}
          </label>
          {uploadError ? (
            <p className="text-xs font-semibold text-danger">{uploadError}</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label={t('form.imageWidth')}
            type="number"
            value={form.image_width}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image_width: value }))
            }
          />
          <TextInput
            label={t('form.imageHeight')}
            type="number"
            value={form.image_height}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image_height: value }))
            }
          />
        </div>
        <label className={labelClass}>
          {t('form.position')}
          <select
            className={inputClass}
            value={form.position}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                position: event.target.value as HeroPosition,
              }))
            }
          >
            {HERO_POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(`options.position.${option.labelKey}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-ink dark:text-surface">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                isDefault: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary dark:border-dark-border"
          />
          {t('form.defaultImage')}
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            {t('form.textTone')}
            <select
              className={inputClass}
              value={form.textTone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  textTone: event.target.value as HeroTone,
                }))
              }
            >
              {HERO_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.tone.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('form.navTone')}
            <select
              className={inputClass}
              value={form.navTone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  navTone: event.target.value as HeroTone,
                }))
              }
            >
              {HERO_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.tone.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('form.overlay')}
            <select
              className={inputClass}
              value={form.overlayTone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  overlayTone: event.target.value as HeroOverlayTone,
                }))
              }
            >
              {HERO_OVERLAY_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.overlay.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextArea
          label={t('form.description')}
          value={activeTranslation.description}
          onChange={(value) => updateTranslationField('description', value)}
        />
        <TextArea
          label={t('form.detailedDescription')}
          value={activeTranslation.detailed_description}
          onChange={(value) =>
            updateTranslationField('detailed_description', value)
          }
        />
        <button
          type="submit"
          disabled={
            isSaving ||
            !form.heroTypeId ||
            (selectedHeroType ? isHeroTypeDisabled(selectedHeroType) : true) ||
            (isProductHero && !form.targetCategoryId)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          {t('form.save')}
        </button>
      </div>
    </form>
  );
}
