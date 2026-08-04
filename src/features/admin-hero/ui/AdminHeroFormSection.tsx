import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy, IconPlus, IconUpload } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';

import {
  CloudinaryUploadError,
  cloudinaryUploadErrorKeyByCode,
  uploadCloudinaryImage,
} from '@shared/lib/cloudinary/uploadImage';
import { getCategoryHref } from '@shared/lib/routes/productRoutes';
import {
  SectionTitle,
  inputClass,
  labelClass,
  textareaClass,
} from '@shared/ui/AdminControls';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import { adminHeroFormSchema } from '../model/schema';
import {
  getAdminHeroTypeLabelKey,
  getFirstAvailableAdminHeroType,
  isAdminHeroTypeDisabled,
} from '../model/types';

import type {
  AdminHeroCategory,
  AdminHeroType,
  HeroFormState,
  HeroOverlayTone,
  HeroPosition,
  HeroTone,
  HeroTranslationLocale,
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
  initialValues: HeroFormState;
  heroTypes: AdminHeroType[];
  categories: AdminHeroCategory[];
  isSaving: boolean;
  onReset: () => void;
  onSubmit: (formValues: HeroFormState) => Promise<void>;
};

export default function AdminHeroFormSection({
  initialValues,
  heroTypes,
  categories,
  isSaving,
  onReset,
  onSubmit,
}: AdminHeroFormSectionProps) {
  const locale = useLocale();
  const activeTranslationLocale: HeroTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const t = useTranslations('AdminHero');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const methods = useForm<HeroFormState>({
    resolver: zodResolver(adminHeroFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { control, getValues, handleSubmit, register, setValue } = methods;
  const [heroTypeId, targetCategoryId] = useWatch({
    control,
    name: ['heroTypeId', 'targetCategoryId'],
  });
  const selectedHeroType = heroTypes.find(
    (type) => String(type.id) === heroTypeId,
  );
  const isProductHero = selectedHeroType?.name === 'product';
  const selectedTargetCategory = categories.find(
    (category) => String(category.id) === targetCategoryId,
  );
  const selectedHeroPath =
    selectedHeroType?.name === 'main'
      ? '/'
      : selectedHeroType?.name === 'product-all'
        ? '/products'
        : selectedHeroType?.name === 'product-discounts'
          ? '/products/discounts'
          : null;
  const translationFieldPrefix =
    `translations.${activeTranslationLocale}` as const;
  const translationNameRegistration = register(
    `${translationFieldPrefix}.name`,
    { required: true },
  );
  const translationDescriptionRegistration = register(
    `${translationFieldPrefix}.description`,
  );
  const translationDetailedDescriptionRegistration = register(
    `${translationFieldPrefix}.detailed_description`,
  );
  const heroTypeRegistration = register('heroTypeId', { required: true });
  const targetCategoryRegistration = register('targetCategoryId');

  const getHeroTypeLabel = (name: string) => {
    const labelKey = getAdminHeroTypeLabelKey(name);

    return labelKey ? t(labelKey) : name;
  };

  const setCategoryNames = useCallback(
    (category: AdminHeroCategory, onlyWhenEmpty = false) => {
      const setName = (
        fieldName:
          | 'name_en'
          | 'name_ko'
          | 'translations.en.name'
          | 'translations.ko.name',
        value: string,
      ) => {
        if (onlyWhenEmpty && getValues(fieldName)) {
          return;
        }

        setValue(fieldName, value, {
          shouldDirty: !onlyWhenEmpty,
          shouldValidate: true,
        });
      };

      setName('name_en', category.name_en);
      setName('name_ko', category.name_ko);
      setName('translations.en.name', category.name_en);
      setName('translations.ko.name', category.name_ko);
    },
    [getValues, setValue],
  );

  useEffect(() => {
    const currentHeroTypeId = getValues('heroTypeId');
    const currentHeroType = heroTypes.find(
      (type) => String(type.id) === currentHeroTypeId,
    );
    const nextHeroType =
      currentHeroType && !isAdminHeroTypeDisabled(currentHeroType, categories)
        ? currentHeroType
        : getFirstAvailableAdminHeroType(heroTypes, categories);

    if (!nextHeroType) {
      setValue('heroTypeId', '', { shouldValidate: true });
      setValue('targetCategoryId', '', { shouldValidate: true });
      return;
    }

    const nextHeroTypeId = String(nextHeroType.id);
    if (currentHeroTypeId !== nextHeroTypeId) {
      setValue('heroTypeId', nextHeroTypeId, { shouldValidate: true });
    }

    if (nextHeroType.name !== 'product') {
      setValue('targetCategoryId', '', { shouldValidate: true });
      return;
    }

    const currentCategoryId = getValues('targetCategoryId');
    const nextCategory =
      categories.find(
        (category) => String(category.id) === currentCategoryId,
      ) ?? categories[0];

    if (nextCategory) {
      setValue('targetCategoryId', String(nextCategory.id), {
        shouldValidate: true,
      });
      setCategoryNames(nextCategory, true);
    }
  }, [categories, getValues, heroTypes, setCategoryNames, setValue]);

  const handleHeroTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    void heroTypeRegistration.onChange(event);
    const nextHeroType = heroTypes.find(
      (type) => String(type.id) === event.target.value,
    );

    if (nextHeroType?.name !== 'product') {
      setValue('targetCategoryId', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    const defaultCategory = categories[0];
    setValue('targetCategoryId', String(defaultCategory?.id ?? ''), {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (defaultCategory) {
      setCategoryNames(defaultCategory);
    }
  };

  const handleTargetCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    void targetCategoryRegistration.onChange(event);
    const category = categories.find(
      (item) => String(item.id) === event.target.value,
    );

    if (category) {
      setCategoryNames(category);
    }
  };

  const handleTranslationNameChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    void translationNameRegistration.onChange(event);
    setValue(
      activeTranslationLocale === 'en' ? 'name_en' : 'name_ko',
      event.target.value,
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleTranslationDescriptionChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    void translationDescriptionRegistration.onChange(event);
    if (activeTranslationLocale === 'ko') {
      setValue('description', event.target.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleTranslationDetailedDescriptionChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    void translationDetailedDescriptionRegistration.onChange(event);
    if (activeTranslationLocale === 'ko') {
      setValue('detailed_description', event.target.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const parsedHeroTypeId = Number(getValues('heroTypeId'));
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

      setValue('image_url', uploaded.image_url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setUploadError(getUploadErrorMessage(error, t));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <input type="hidden" {...register('id')} />
      <input type="hidden" {...register('name_en')} />
      <input type="hidden" {...register('name_ko')} />
      <input type="hidden" {...register('description')} />
      <input type="hidden" {...register('detailed_description')} />
      <SectionTitle
        title={initialValues.id ? t('form.editTitle') : t('form.createTitle')}
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
            {...heroTypeRegistration}
            className={inputClass}
            onChange={handleHeroTypeChange}
            required
          >
            {heroTypes.map((type) => (
              <option
                key={type.id}
                value={type.id}
                disabled={isAdminHeroTypeDisabled(type, categories)}
              >
                {getHeroTypeLabel(type.name)}
                {isAdminHeroTypeDisabled(type, categories)
                  ? t('form.disabledSuffix')
                  : ''}
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
              {...targetCategoryRegistration}
              className={inputClass}
              onChange={handleTargetCategoryChange}
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
        <label className={labelClass}>
          {activeTranslationLocale === 'en'
            ? t('form.nameEn')
            : t('form.nameKo')}
          <input
            {...translationNameRegistration}
            className={inputClass}
            onChange={handleTranslationNameChange}
            required
          />
        </label>
        <label className={labelClass}>
          {t('form.imageUrl')}
          <input className={inputClass} {...register('image_url')} />
        </label>
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
          <label className={labelClass}>
            {t('form.imageWidth')}
            <input
              type="number"
              min={1}
              step={1}
              className={inputClass}
              {...register('image_width')}
            />
          </label>
          <label className={labelClass}>
            {t('form.imageHeight')}
            <input
              type="number"
              min={1}
              step={1}
              className={inputClass}
              {...register('image_height')}
            />
          </label>
        </div>
        <label className={labelClass}>
          {t('form.position')}
          <select className={inputClass} {...register('position')}>
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
            {...register('isDefault')}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary dark:border-dark-border"
          />
          {t('form.defaultImage')}
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            {t('form.textTone')}
            <select className={inputClass} {...register('textTone')}>
              {HERO_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.tone.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('form.navTone')}
            <select className={inputClass} {...register('navTone')}>
              {HERO_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.tone.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('form.overlay')}
            <select className={inputClass} {...register('overlayTone')}>
              {HERO_OVERLAY_TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(`options.overlay.${option.labelKey}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          {t('form.description')}
          <textarea
            {...translationDescriptionRegistration}
            className={textareaClass}
            onChange={handleTranslationDescriptionChange}
          />
        </label>
        <label className={labelClass}>
          {t('form.detailedDescription')}
          <textarea
            {...translationDetailedDescriptionRegistration}
            className={textareaClass}
            onChange={handleTranslationDetailedDescriptionChange}
          />
        </label>
        <button
          type="submit"
          disabled={
            isSaving ||
            isUploading ||
            !heroTypeId ||
            (selectedHeroType
              ? isAdminHeroTypeDisabled(selectedHeroType, categories)
              : true) ||
            (isProductHero && !targetCategoryId)
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
