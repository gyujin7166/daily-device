import type { Dispatch, SetStateAction } from 'react';
import type { SubmitEvent } from 'react';

import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  PRODUCT_LINE_VALUES,
  isProductLineValue,
} from '@shared/constants/productLine';
import type { ProductLineValue } from '@shared/constants/productLine';
import {
  SectionTitle,
  TextArea,
  TextInput,
  inputClass,
  labelClass,
} from '@shared/ui/AdminControls';

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
) => (locale === 'en' ? category.name_en : category.name_ko) || category.name_en;

type AdminProductFormSectionProps = {
  form: ProductFormState;
  categories: ProductCategory[];
  colors: AdminColor[];
  selectedFormColors: AdminColor[];
  isSaving: boolean;
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  onReset: () => void;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onToggleColor: (colorId: string) => void;
  onAddImage: () => void;
  onUpdateImage: (
    index: number,
    patch: Partial<ProductFormState['images'][number]>,
  ) => void;
  onUpdateImageOrder: (index: number, value: string) => void;
  onRemoveImage: (index: number) => void;
};

export default function AdminProductFormSection({
  form,
  categories,
  colors,
  selectedFormColors,
  isSaving,
  setForm,
  onReset,
  onSubmit,
  onToggleColor,
  onAddImage,
  onUpdateImage,
  onUpdateImageOrder,
  onRemoveImage,
}: AdminProductFormSectionProps) {
  const locale = useLocale();
  const activeTranslationLocale: ProductTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const t = useTranslations('AdminProduct.form');
  const commonT = useTranslations('Common');
  const activeTranslation = form.translations[activeTranslationLocale];
  const updateTranslationField = (
    field: 'name' | 'description' | 'detailed_description' | 'note',
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
      ...(field === 'note' && activeTranslationLocale === 'ko'
        ? { note: value }
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

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title={form.id ? t('editTitle') : t('createTitle')}
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
        <TextInput
          label={
            activeTranslationLocale === 'en' ? t('nameEn') : t('nameKo')
          }
          value={activeTranslation.name}
          onChange={(value) => updateTranslationField('name', value)}
          required
        />
        <TextInput
          label={t('slug')}
          value={form.slug}
          onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))}
          required
        />
        {activeTranslationLocale === 'ko' ? (
          <TextInput
            label={t('searchKeyword')}
            value={form.search_keyword}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, search_keyword: value }))
            }
            required
          />
        ) : null}
        <TextInput
          label={t('price')}
          type="number"
          value={form.price}
          onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
          required
        />
        <TextInput
          label={t('discountRate')}
          type="number"
          value={form.discountRate}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, discountRate: value }))
          }
        />
        <label className={labelClass}>
          {t('category')}
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                categoryId: event.target.value,
              }))
            }
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getLocalizedCategoryName(category, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          {t('productLine')}
          <select
            className={inputClass}
            value={form.productLine}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                productLine: event.target.value as ProductLineValue | '',
              }))
            }
          >
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
          form={form}
          colors={colors}
          selectedFormColors={selectedFormColors}
          locale={locale}
          setForm={setForm}
          onToggleColor={onToggleColor}
        />
        <AdminProductImageFields
          images={form.images}
          categoryId={form.categoryId}
          productSlug={form.slug}
          selectedFormColors={selectedFormColors}
          locale={locale}
          onAddImage={onAddImage}
          onUpdateImage={onUpdateImage}
          onUpdateImageOrder={onUpdateImageOrder}
          onRemoveImage={onRemoveImage}
        />
        <TextArea
          label={t('description')}
          value={activeTranslation.description}
          onChange={(value) => updateTranslationField('description', value)}
          required
        />
        <TextArea
          label={t('detailedDescription')}
          value={activeTranslation.detailed_description}
          onChange={(value) =>
            updateTranslationField('detailed_description', value)
          }
        />
        <TextArea
          label={t('note')}
          value={activeTranslation.note}
          onChange={(value) => updateTranslationField('note', value)}
        />
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
