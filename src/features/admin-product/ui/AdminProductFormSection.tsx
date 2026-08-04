import { useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import {
  PRODUCT_LINE_VALUES,
  isProductLineValue,
} from '@shared/constants/productLine';
import {
  SectionTitle,
  inputClass,
  labelClass,
  textareaClass,
} from '@shared/ui/AdminControls';

import { adminProductFormSchema } from '../model/schema';

import AdminProductColorFields from './AdminProductColorFields';
import AdminProductImageFields from './AdminProductImageFields';

import type {
  AdminColor,
  ProductCategory,
  ProductFormState,
  ProductTranslationLocale,
} from '../model/types';

const getLocalizedCategoryName = (
  category: Pick<ProductCategory, 'name_en' | 'name_ko'>,
  locale: string,
) =>
  (locale === 'en' ? category.name_en : category.name_ko) || category.name_en;

type AdminProductFormSectionProps = {
  initialValues: ProductFormState;
  categories: ProductCategory[];
  colors: AdminColor[];
  isSaving: boolean;
  onReset: () => void;
  onSubmit: (formValues: ProductFormState) => Promise<void>;
};

export default function AdminProductFormSection({
  initialValues,
  categories,
  colors,
  isSaving,
  onReset,
  onSubmit,
}: AdminProductFormSectionProps) {
  const locale = useLocale();
  const activeTranslationLocale: ProductTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const t = useTranslations('AdminProduct.form');
  const commonT = useTranslations('Common');
  const methods = useForm<ProductFormState>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const { control, getValues, handleSubmit, register, setValue } = methods;
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'images',
    keyName: 'fieldKey',
  });
  const colorIds = useWatch({ control, name: 'colorIds' });
  const selectedFormColors = useMemo(
    () => colors.filter((color) => colorIds.includes(String(color.id))),
    [colorIds, colors],
  );
  const translationFieldPrefix =
    `translations.${activeTranslationLocale}` as const;
  const translationNameRegistration = register(
    `${translationFieldPrefix}.name`,
    { required: true },
  );
  const translationDescriptionRegistration = register(
    `${translationFieldPrefix}.description`,
    { required: true },
  );
  const translationDetailedDescriptionRegistration = register(
    `${translationFieldPrefix}.detailed_description`,
  );
  const translationNoteRegistration = register(
    `${translationFieldPrefix}.note`,
  );

  useEffect(() => {
    if (getValues('categoryId') || !categories[0]) {
      return;
    }

    setValue('categoryId', String(categories[0].id), {
      shouldValidate: true,
    });
  }, [categories, getValues, setValue]);

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

  const handleTranslationNoteChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
  ) => {
    void translationNoteRegistration.onChange(event);
    if (activeTranslationLocale === 'ko') {
      setValue('note', event.target.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleToggleColor = (colorId: string, isChecked: boolean) => {
    const currentColorIds = getValues('colorIds');
    const nextColorIds = isChecked
      ? Array.from(new Set([...currentColorIds, colorId]))
      : currentColorIds.filter((item) => item !== colorId);

    setValue('colorIds', nextColorIds, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const currentDefaultColorId = getValues('defaultColorId');
    if (!nextColorIds.includes(currentDefaultColorId)) {
      setValue('defaultColorId', nextColorIds[0] ?? '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (!isChecked) {
      getValues('images').forEach((image, index) => {
        if (image.colorId === colorId) {
          setValue(`images.${index}.colorId`, '', {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });
    }
  };

  const handleAddImage = () => {
    const images = getValues('images');
    const currentColorIds = getValues('colorIds');

    append(
      {
        id: null,
        image_url: '',
        colorId: currentColorIds.length > 0 ? getValues('defaultColorId') : '',
        order: String(images.length),
        isMain: images.length === 0,
      },
      { shouldFocus: false },
    );
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
      <input type="hidden" {...register('note')} />
      <SectionTitle
        title={initialValues.id ? t('editTitle') : t('createTitle')}
        action={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconPlus size={16} />
            {t('new')}
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <label className={labelClass}>
          {activeTranslationLocale === 'en' ? t('nameEn') : t('nameKo')}
          <input
            {...translationNameRegistration}
            className={inputClass}
            onChange={handleTranslationNameChange}
            required
          />
        </label>
        <label className={labelClass}>
          {t('slug')}
          <input className={inputClass} {...register('slug')} required />
        </label>
        {activeTranslationLocale === 'ko' ? (
          <label className={labelClass}>
            {t('searchKeyword')}
            <input
              className={inputClass}
              {...register('search_keyword')}
              required
            />
          </label>
        ) : (
          <input type="hidden" {...register('search_keyword')} />
        )}
        <label className={labelClass}>
          {t('price')}
          <input
            type="number"
            min={0}
            className={inputClass}
            {...register('price')}
            required
          />
        </label>
        <label className={labelClass}>
          {t('discountRate')}
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            {...register('discountRate')}
          />
        </label>
        <label className={labelClass}>
          {t('category')}
          <select className={inputClass} {...register('categoryId')} required>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getLocalizedCategoryName(category, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {t('productLine')}
          <select className={inputClass} {...register('productLine')}>
            <option value="">{t('none')}</option>
            {PRODUCT_LINE_VALUES.map((value) => (
              <option key={value} value={value}>
                {isProductLineValue(value)
                  ? commonT(`productLines.${value}`)
                  : value}
              </option>
            ))}
          </select>
        </label>
        <AdminProductColorFields
          colors={colors}
          colorIds={colorIds}
          selectedFormColors={selectedFormColors}
          locale={locale}
          register={register}
          onToggleColor={handleToggleColor}
        />
        <AdminProductImageFields
          fields={fields}
          selectedFormColors={selectedFormColors}
          locale={locale}
          getValues={getValues}
          register={register}
          setValue={setValue}
          onAddImage={handleAddImage}
          onRemoveImage={remove}
        />
        <label className={labelClass}>
          {t('description')}
          <textarea
            {...translationDescriptionRegistration}
            className={textareaClass}
            onChange={handleTranslationDescriptionChange}
            required
          />
        </label>
        <label className={labelClass}>
          {t('detailedDescription')}
          <textarea
            {...translationDetailedDescriptionRegistration}
            className={textareaClass}
            onChange={handleTranslationDetailedDescriptionChange}
          />
        </label>
        <label className={labelClass}>
          {t('note')}
          <textarea
            {...translationNoteRegistration}
            className={textareaClass}
            onChange={handleTranslationNoteChange}
          />
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          {t('save')}
        </button>
      </div>
    </form>
  );
}
