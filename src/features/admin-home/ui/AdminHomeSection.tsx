import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconDeviceFloppy,
  IconPencil,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';

import {
  getCategoryHref,
  getProductHref,
} from '@shared/lib/routes/productRoutes';
import { cn } from '@shared/lib/utils/style';
import {
  ImageUrlList,
  PaginationControls,
  SectionTitle,
  TableHeader,
  inputClass,
  labelClass,
  textareaClass,
} from '@shared/ui/AdminControls';

import {
  adminHomeSectionFormSchema,
  adminHomeSectionItemFormSchema,
} from '../model/schema';
import {
  createEmptyHomeSectionItemForm,
  createHomeSectionForm,
  createHomeSectionItemForm,
} from '../model/types';
import {
  useSaveAdminHomeSectionItemMutation,
  useUpdateAdminHomeSectionMutation,
} from '../queries/useAdminHome';

import type {
  AdminHomeCategory,
  AdminHomePayload,
  AdminHomeProduct,
  AdminHomeSection as AdminHomeSectionType,
  AdminHomeSectionItem,
  HomeTranslationLocale,
  HomeSectionFormState,
  HomeSectionItemFormState,
} from '../model/types';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';

const EMPTY_SECTIONS: AdminHomeSectionType[] = [];
const EMPTY_CATEGORIES: AdminHomeCategory[] = [];
const EMPTY_PRODUCTS: AdminHomeProduct[] = [];
const ADMIN_HOME_LIST_PAGE_SIZE = 10;
const HOME_LAYOUT_DISABLED_PRESET = {
  labelKey: 'disabled',
  layoutGroupClassName: '',
  areaOptions: [{ labelKey: 'default', value: '' }],
} as const;
const HOME_LAYOUT_PRESETS = [
  {
    labelKey: 'threeColumn',
    layoutGroupClassName: 'lg:grid-areas-home-3',
    areaOptions: [
      { labelKey: 'leftCard', value: 'lg:grid-in-j' },
      { labelKey: 'centerCard', value: 'lg:grid-in-k' },
      { labelKey: 'rightCard', value: 'lg:grid-in-l' },
    ],
  },
] as const;
const HOME_LAYOUT_OPTIONS = [
  HOME_LAYOUT_DISABLED_PRESET,
  ...HOME_LAYOUT_PRESETS,
];
const IMAGE_FIT_OPTIONS = [
  { labelKey: 'default', value: '' },
  { labelKey: 'fitCover', value: 'object-cover' },
  { labelKey: 'fitContain', value: 'object-contain' },
] as const;

const getLocalizedName = (
  item: { name_en: string; name_ko?: string | null },
  locale: string,
) => (locale === 'en' ? item.name_en : item.name_ko) || item.name_en;

const getHomeLocale = (locale: string): HomeTranslationLocale =>
  locale === 'en' ? 'en' : 'ko';

const getLocalizedSectionTitle = (
  section: AdminHomeSectionType,
  locale: string,
) =>
  section.translations.find(
    (translation) => translation.locale === getHomeLocale(locale),
  )?.title ?? section.title;

const getLocalizedItemTitle = (item: AdminHomeSectionItem, locale: string) =>
  item.translations.find(
    (translation) => translation.locale === getHomeLocale(locale),
  )?.title ?? item.title;

const getLocalizedItemLabel = (item: AdminHomeSectionItem, locale: string) =>
  item.translations.find(
    (translation) => translation.locale === getHomeLocale(locale),
  )?.label ?? item.label;

const getLayoutTemplateLimit = (
  template: (typeof HOME_LAYOUT_OPTIONS)[number],
) => template.areaOptions.filter((option) => option.value).length;

const getLayoutTemplate = (layoutGroupClassName: string) =>
  HOME_LAYOUT_OPTIONS.find(
    (template) => template.layoutGroupClassName === layoutGroupClassName,
  ) ?? HOME_LAYOUT_DISABLED_PRESET;

type AdminHomeSectionProps = {
  data?: AdminHomePayload;
  isPending: boolean;
  canWriteAdmin: boolean;
  onMessage: (message: string) => void;
  onError: (error: unknown) => void;
  onReadOnlyAction: () => void;
};

export default function AdminHomeSection({
  data,
  isPending,
  canWriteAdmin,
  onMessage,
  onError,
  onReadOnlyAction,
}: AdminHomeSectionProps) {
  const t = useTranslations('AdminHome.feedback');
  const locale = useLocale();
  const sections = data?.sections ?? EMPTY_SECTIONS;
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const products = data?.products ?? EMPTY_PRODUCTS;
  const updateSectionMutation = useUpdateAdminHomeSectionMutation();
  const saveItemMutation = useSaveAdminHomeSectionItemMutation();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [editingItem, setEditingItem] = useState<AdminHomeSectionItem | null>(
    null,
  );
  const [creatingItemDisplayOrder, setCreatingItemDisplayOrder] = useState<
    number | null
  >(null);
  const [sectionFormVersion, setSectionFormVersion] = useState(0);
  const [itemFormVersion, setItemFormVersion] = useState(0);
  const isSaving =
    updateSectionMutation.isPending || saveItemMutation.isPending;

  const selectedSection = useMemo(
    () =>
      sections.find((section) => section.id === selectedSectionId) ??
      sections[0],
    [sections, selectedSectionId],
  );

  useEffect(() => {
    if (!selectedSection) {
      setSelectedSectionId(null);
      setEditingItem(null);
      setCreatingItemDisplayOrder(null);
      return;
    }

    setSelectedSectionId(selectedSection.id);
    setEditingItem((previousItem) => {
      return (
        selectedSection.items.find((item) => item.id === previousItem?.id) ??
        selectedSection.items[0] ??
        null
      );
    });
    setCreatingItemDisplayOrder(null);
    setSectionFormVersion((version) => version + 1);
    setItemFormVersion((version) => version + 1);
  }, [selectedSection]);

  const handleSectionSelect = (section: AdminHomeSectionType) => {
    setSelectedSectionId(section.id);
    setEditingItem(section.items[0] ?? null);
    setCreatingItemDisplayOrder(null);
    setSectionFormVersion((version) => version + 1);
    setItemFormVersion((version) => version + 1);
  };

  const handleSectionSubmit = async (formValues: HomeSectionFormState) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const savedSection = await updateSectionMutation.mutateAsync(formValues);
      onMessage(
        t('sectionSaved', {
          title: getLocalizedSectionTitle(savedSection, locale),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('sectionSaveFailed'));
    }
  };

  const handleItemSubmit = async (formValues: HomeSectionItemFormState) => {
    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    try {
      const action = formValues.id ? t('editAction') : t('createAction');
      const savedItem = await saveItemMutation.mutateAsync(formValues);
      setEditingItem(savedItem);
      setCreatingItemDisplayOrder(null);
      setItemFormVersion((version) => version + 1);
      onMessage(
        t('cardSaved', {
          action,
          title: getLocalizedItemTitle(savedItem, locale),
        }),
      );
    } catch (error) {
      onError(error instanceof Error ? error : t('cardSaveFailed'));
    }
  };

  const handleCreateItem = () => {
    if (!selectedSection) {
      return;
    }

    const nextDisplayOrder =
      selectedSection.items.reduce(
        (maxOrder, item) => Math.max(maxOrder, item.displayOrder),
        0,
      ) + 1;

    setEditingItem(null);
    setCreatingItemDisplayOrder(nextDisplayOrder);
    setItemFormVersion((version) => version + 1);
  };

  const handleEditItem = (item: AdminHomeSectionItem) => {
    setEditingItem(item);
    setCreatingItemDisplayOrder(null);
    setItemFormVersion((version) => version + 1);
  };

  const handleResetItemForm = () => {
    if (creatingItemDisplayOrder !== null) {
      setItemFormVersion((version) => version + 1);
      return;
    }

    const selectedItem = selectedSection?.items.find(
      (item) => item.id === editingItem?.id,
    );
    if (selectedItem) {
      setEditingItem(selectedItem);
    }
    setItemFormVersion((version) => version + 1);
  };

  const itemInitialValues = selectedSection
    ? creatingItemDisplayOrder !== null
      ? createEmptyHomeSectionItemForm(
          selectedSection.id,
          creatingItemDisplayOrder,
        )
      : editingItem
        ? createHomeSectionItemForm(editingItem)
        : null
    : null;

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        {t('loading')}
      </div>
    );
  }

  if (!selectedSection) {
    return (
      <div className="rounded-md border border-line bg-surface p-8 text-center text-sm font-semibold text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted">
        {t('emptySections')}
      </div>
    );
  }

  const isCategoryCarouselSection = selectedSection.key === 'category-carousel';

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="order-2 grid content-start gap-6 xl:order-1">
        <HomeSectionForm
          key={`${selectedSection.id}-${sectionFormVersion}`}
          initialValues={createHomeSectionForm(selectedSection)}
          isSaving={isSaving}
          onSubmit={handleSectionSubmit}
          onReset={() => setSectionFormVersion((version) => version + 1)}
        />
        {itemInitialValues ? (
          <HomeSectionItemForm
            key={`${creatingItemDisplayOrder !== null ? 'new' : (editingItem?.id ?? 'empty')}-${itemFormVersion}`}
            initialValues={itemInitialValues}
            categories={categories}
            products={products}
            sectionItems={selectedSection.items}
            enforceCarouselLayout={isCategoryCarouselSection}
            isSaving={isSaving}
            onSubmit={handleItemSubmit}
            onReset={handleResetItemForm}
          />
        ) : null}
      </div>

      <div className="order-1 grid content-start gap-6 xl:order-2">
        <HomeSectionList
          sections={sections}
          selectedSectionId={selectedSection.id}
          onSelect={handleSectionSelect}
        />
        <HomeSectionItemList
          items={selectedSection.items}
          selectedItemId={editingItem?.id ?? null}
          isSaving={isSaving}
          onCreate={handleCreateItem}
          onEdit={handleEditItem}
        />
      </div>
    </section>
  );
}

function HomeSectionList({
  sections,
  selectedSectionId,
  onSelect,
}: {
  sections: AdminHomeSectionType[];
  selectedSectionId: number;
  onSelect: (section: AdminHomeSectionType) => void;
}) {
  const t = useTranslations('AdminHome.sectionList');
  const locale = useLocale();
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(sections.length / ADMIN_HOME_LIST_PAGE_SIZE),
  );
  const paginatedSections = sections.slice(
    (page - 1) * ADMIN_HOME_LIST_PAGE_SIZE,
    page * ADMIN_HOME_LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const selectedIndex = sections.findIndex(
      (section) => section.id === selectedSectionId,
    );

    if (selectedIndex >= 0) {
      setPage(Math.floor(selectedIndex / ADMIN_HOME_LIST_PAGE_SIZE) + 1);
    }
  }, [sections, selectedSectionId]);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <TableHeader title={t('title')} count={sections.length} />
      <div className="grid gap-2 p-3">
        {paginatedSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section)}
            className={cn(
              'rounded-md border px-3 py-3 text-left transition',
              selectedSectionId === section.id
                ? 'border-primary bg-primary-soft/80 text-primary dark:bg-primary/15'
                : 'border-line hover:border-primary dark:border-dark-border',
            )}
          >
            <p className="text-sm font-bold">
              {getLocalizedSectionTitle(section, locale)}
            </p>
            <p className="mt-1 text-xs text-muted dark:text-dark-muted">
              {t('cardCount', {
                key: section.key,
                count: format.number(section.items.length),
              })}
            </p>
          </button>
        ))}
      </div>
      {totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

function HomeSectionForm({
  initialValues,
  isSaving,
  onSubmit,
  onReset,
}: {
  initialValues: HomeSectionFormState;
  isSaving: boolean;
  onSubmit: (formValues: HomeSectionFormState) => Promise<void>;
  onReset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('AdminHome.sectionForm');
  const activeTranslationLocale: HomeTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const { handleSubmit, register, setValue } = useForm<HomeSectionFormState>({
    resolver: zodResolver(adminHomeSectionFormSchema),
    defaultValues: initialValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });
  const translationFieldPrefix =
    `translations.${activeTranslationLocale}` as const;
  const eyebrowRegistration = register(`${translationFieldPrefix}.eyebrow`);
  const titleRegistration = register(`${translationFieldPrefix}.title`, {
    required: true,
  });
  const subtitleRegistration = register(`${translationFieldPrefix}.subtitle`);

  const updateBaseTranslationField = (
    field: 'eyebrow' | 'title' | 'subtitle',
    value: string,
  ) => {
    if (activeTranslationLocale === 'ko') {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <input type="hidden" {...register('id')} />
      <input type="hidden" {...register('eyebrow')} />
      <input type="hidden" {...register('title')} />
      <input type="hidden" {...register('subtitle')} />
      <SectionTitle
        title={t('title')}
        action={
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconRefresh size={16} />
            {t('refresh')}
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <label className={labelClass}>
          {t('eyebrow')}
          <input
            {...eyebrowRegistration}
            className={inputClass}
            onChange={(event) => {
              void eyebrowRegistration.onChange(event);
              updateBaseTranslationField('eyebrow', event.target.value);
            }}
          />
        </label>
        <label className={labelClass}>
          {t('sectionTitle')}
          <input
            {...titleRegistration}
            className={inputClass}
            onChange={(event) => {
              void titleRegistration.onChange(event);
              updateBaseTranslationField('title', event.target.value);
            }}
            required
          />
        </label>
        <label className={labelClass}>
          {t('subtitle')}
          <textarea
            {...subtitleRegistration}
            className={textareaClass}
            onChange={(event) => {
              void subtitleRegistration.onChange(event);
              updateBaseTranslationField('subtitle', event.target.value);
            }}
          />
        </label>
        <label className={labelClass}>
          {t('displayOrder')}
          <input
            type="number"
            min={0}
            step={1}
            className={inputClass}
            {...register('displayOrder')}
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" {...register('isVisible')} />
          {t('visible')}
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

function HomeSectionItemList({
  items,
  selectedItemId,
  isSaving,
  onCreate,
  onEdit,
}: {
  items: AdminHomeSectionItem[];
  selectedItemId: number | null;
  isSaving: boolean;
  onCreate: () => void;
  onEdit: (item: AdminHomeSectionItem) => void;
}) {
  const t = useTranslations('AdminHome.cardList');
  const locale = useLocale();
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / ADMIN_HOME_LIST_PAGE_SIZE),
  );
  const paginatedItems = items.slice(
    (page - 1) * ADMIN_HOME_LIST_PAGE_SIZE,
    page * ADMIN_HOME_LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const selectedIndex = items.findIndex((item) => item.id === selectedItemId);

    if (selectedIndex >= 0) {
      setPage(Math.floor(selectedIndex / ADMIN_HOME_LIST_PAGE_SIZE) + 1);
    }
  }, [items, selectedItemId]);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 dark:border-dark-border">
        <div className="flex items-center gap-2">
          <h2 className="font-bold">{t('title')}</h2>
          <span className="text-sm font-semibold text-muted dark:text-dark-muted">
            {format.number(items.length)}
          </span>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={onCreate}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
        >
          <IconPlus size={16} />
          {t('add')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead className="bg-canvas text-xs uppercase text-muted dark:bg-dark-bg dark:text-dark-muted">
            <tr>
              <th className="px-3 py-3">{t('order')}</th>
              <th className="px-3 py-3">{t('cardTitle')}</th>
              <th className="px-3 py-3">{t('target')}</th>
              <th className="px-3 py-3">{t('image')}</th>
              <th className="px-3 py-3">{t('manage')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'border-t border-line dark:border-dark-border',
                  selectedItemId === item.id &&
                    'bg-primary-soft/80 dark:bg-primary/15',
                )}
              >
                <td className="px-3 py-3 font-semibold">{item.displayOrder}</td>
                <td className="px-3 py-3">
                  <p className="font-semibold">
                    {getLocalizedItemTitle(item, locale)}
                  </p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {item.isVisible ? t('visible') : t('hidden')} /{' '}
                    {getLocalizedItemLabel(item, locale) ?? '-'}
                  </p>
                </td>
                <td className="px-3 py-3 text-xs text-muted dark:text-dark-muted">
                  {getItemHrefPreview(item)}
                </td>
                <td className="px-3 py-3">
                  <ImageUrlList
                    items={[{ id: item.id, url: item.image_url }]}
                  />
                </td>
                <td className="px-2 py-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => onEdit(item)}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
                  >
                    <IconPencil size={16} />
                    {t('edit')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}

function HomeSectionItemForm({
  initialValues,
  categories,
  products,
  sectionItems,
  enforceCarouselLayout,
  isSaving,
  onSubmit,
  onReset,
}: {
  initialValues: HomeSectionItemFormState;
  categories: AdminHomeCategory[];
  products: AdminHomeProduct[];
  sectionItems: AdminHomeSectionItem[];
  enforceCarouselLayout: boolean;
  isSaving: boolean;
  onSubmit: (formValues: HomeSectionItemFormState) => Promise<void>;
  onReset: () => void;
}) {
  const t = useTranslations('AdminHome');
  const locale = useLocale();
  const activeTranslationLocale: HomeTranslationLocale =
    locale === 'en' ? 'en' : 'ko';
  const { control, handleSubmit, register, setValue } =
    useForm<HomeSectionItemFormState>({
      resolver: zodResolver(adminHomeSectionItemFormSchema),
      defaultValues: initialValues,
      mode: 'onChange',
      reValidateMode: 'onChange',
    });
  const [
    targetType,
    targetCategoryId,
    targetProductId,
    href,
    layoutGroup,
    layoutGroupClassName,
    layoutAreaClassName,
    isVisible,
  ] = useWatch({
    control,
    name: [
      'targetType',
      'targetCategoryId',
      'targetProductId',
      'href',
      'layoutGroup',
      'layoutGroupClassName',
      'layoutAreaClassName',
      'isVisible',
    ],
  });
  const selectedLayoutTemplate = getLayoutTemplate(layoutGroupClassName);
  const selectedLayoutGroup = Number(layoutGroup || 0);
  const selectedLayoutLimit = getLayoutTemplateLimit(selectedLayoutTemplate);
  const visibleItemsInSelectedGroup = sectionItems.filter(
    (item) =>
      item.id !== initialValues.id &&
      item.isVisible &&
      selectedLayoutGroup > 0 &&
      item.layoutGroup === selectedLayoutGroup,
  );
  const usedLayoutAreas = new Set(
    visibleItemsInSelectedGroup.flatMap((item) =>
      item.layoutAreaClassName ? [item.layoutAreaClassName] : [],
    ),
  );
  const existingLayoutClassNameInSelectedGroup =
    visibleItemsInSelectedGroup.find((item) => item.layoutGroupClassName)
      ?.layoutGroupClassName ?? null;
  const isSelectedLayoutFull =
    enforceCarouselLayout &&
    isVisible &&
    selectedLayoutGroup > 0 &&
    selectedLayoutLimit > 0 &&
    visibleItemsInSelectedGroup.length >= selectedLayoutLimit;
  const isSelectedLayoutAreaUsed =
    enforceCarouselLayout &&
    isVisible &&
    selectedLayoutGroup > 0 &&
    Boolean(layoutAreaClassName) &&
    usedLayoutAreas.has(layoutAreaClassName);
  const isSelectedLayoutPresetConflict =
    enforceCarouselLayout &&
    isVisible &&
    selectedLayoutGroup > 0 &&
    Boolean(existingLayoutClassNameInSelectedGroup) &&
    existingLayoutClassNameInSelectedGroup !== layoutGroupClassName;
  const layoutHelperText =
    selectedLayoutGroup === 0
      ? t('cardForm.disabledHelper')
      : t('cardForm.usageHelper', {
          page: selectedLayoutGroup,
          preset: t(`layout.${selectedLayoutTemplate.labelKey}`),
          used: visibleItemsInSelectedGroup.length,
          limit: selectedLayoutLimit,
        });
  const translationFieldPrefix =
    `translations.${activeTranslationLocale}` as const;
  const labelRegistration = register(`${translationFieldPrefix}.label`);
  const titleRegistration = register(`${translationFieldPrefix}.title`, {
    required: true,
  });
  const descriptionRegistration = register(
    `${translationFieldPrefix}.description`,
  );
  const ctaRegistration = register(`${translationFieldPrefix}.cta`);
  const imageAltRegistration = register(`${translationFieldPrefix}.imageAlt`);

  const updateBaseTranslationField = (
    field: 'label' | 'title' | 'description' | 'cta' | 'imageAlt',
    value: string,
  ) => {
    if (activeTranslationLocale === 'ko') {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <input type="hidden" {...register('id')} />
      <input type="hidden" {...register('sectionId')} />
      <input type="hidden" {...register('label')} />
      <input type="hidden" {...register('title')} />
      <input type="hidden" {...register('description')} />
      <input type="hidden" {...register('cta')} />
      <input type="hidden" {...register('imageAlt')} />
      <SectionTitle
        title={
          initialValues.id ? t('cardForm.editTitle') : t('cardForm.createTitle')
        }
        action={
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconRefresh size={16} />
            {t('cardForm.refresh')}
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={labelClass}>
            {t('cardForm.label')}
            <input
              {...labelRegistration}
              className={inputClass}
              onChange={(event) => {
                void labelRegistration.onChange(event);
                updateBaseTranslationField('label', event.target.value);
              }}
            />
          </label>
          <label className={labelClass}>
            {t('cardForm.displayOrder')}
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              {...register('displayOrder')}
            />
          </label>
        </div>
        <label className={labelClass}>
          {t('cardForm.title')}
          <input
            {...titleRegistration}
            className={inputClass}
            onChange={(event) => {
              void titleRegistration.onChange(event);
              updateBaseTranslationField('title', event.target.value);
            }}
            required
          />
        </label>
        <label className={labelClass}>
          {t('cardForm.description')}
          <textarea
            {...descriptionRegistration}
            className={textareaClass}
            onChange={(event) => {
              void descriptionRegistration.onChange(event);
              updateBaseTranslationField('description', event.target.value);
            }}
          />
        </label>
        <label className={labelClass}>
          CTA
          <input
            {...ctaRegistration}
            className={inputClass}
            onChange={(event) => {
              void ctaRegistration.onChange(event);
              updateBaseTranslationField('cta', event.target.value);
            }}
          />
        </label>
        <label className={labelClass}>
          {t('cardForm.imageUrl')}
          <input className={inputClass} {...register('image_url')} required />
        </label>
        <label className={labelClass}>
          {t('cardForm.imageAlt')}
          <input
            {...imageAltRegistration}
            className={inputClass}
            onChange={(event) => {
              void imageAltRegistration.onChange(event);
              updateBaseTranslationField('imageAlt', event.target.value);
            }}
          />
        </label>
        <TargetFields
          targetType={targetType}
          targetCategoryId={targetCategoryId}
          targetProductId={targetProductId}
          href={href}
          categories={categories}
          products={products}
          register={register}
          setValue={setValue}
        />
        <details className="rounded-md border border-line p-3 dark:border-dark-border">
          <summary className="cursor-pointer text-sm font-bold">
            {t('cardForm.layoutOptions')}
          </summary>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                {t('cardForm.carouselPage')}
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  {...register('layoutGroup')}
                  onChange={(event) => {
                    const nextGroup = Math.max(
                      0,
                      Number(event.target.value || 0),
                    );
                    const existingItemInNextGroup = sectionItems.find(
                      (item) =>
                        item.id !== initialValues.id &&
                        item.isVisible &&
                        nextGroup > 0 &&
                        item.layoutGroup === nextGroup &&
                        item.layoutGroupClassName,
                    );
                    const existingPreset = HOME_LAYOUT_PRESETS.find(
                      (preset) =>
                        preset.layoutGroupClassName ===
                        existingItemInNextGroup?.layoutGroupClassName,
                    );
                    const fallbackPreset =
                      selectedLayoutTemplate.layoutGroupClassName
                        ? selectedLayoutTemplate
                        : HOME_LAYOUT_PRESETS[0];
                    const nextTemplate =
                      nextGroup > 0
                        ? (existingPreset ?? fallbackPreset)
                        : HOME_LAYOUT_DISABLED_PRESET;
                    const nextUsedAreas = new Set(
                      sectionItems.flatMap((item) =>
                        item.id !== initialValues.id &&
                        item.isVisible &&
                        nextGroup > 0 &&
                        item.layoutGroup === nextGroup &&
                        item.layoutAreaClassName
                          ? [item.layoutAreaClassName]
                          : [],
                      ),
                    );
                    const nextAreaOption =
                      nextTemplate.areaOptions.find(
                        (option) =>
                          !option.value || !nextUsedAreas.has(option.value),
                      ) ?? nextTemplate.areaOptions[0];

                    setValue('layoutGroup', String(nextGroup), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue(
                      'layoutGroupClassName',
                      nextTemplate.layoutGroupClassName,
                      { shouldDirty: true, shouldValidate: true },
                    );
                    setValue(
                      'layoutAreaClassName',
                      nextAreaOption?.value ?? '',
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                />
              </label>
              <label className={labelClass}>
                {t('cardForm.layoutPreset')}
                <select
                  className={inputClass}
                  {...register('layoutGroupClassName')}
                  onChange={(event) => {
                    const nextTemplate =
                      HOME_LAYOUT_OPTIONS.find(
                        (template) =>
                          template.layoutGroupClassName === event.target.value,
                      ) ?? HOME_LAYOUT_DISABLED_PRESET;
                    const nextGroup = nextTemplate.layoutGroupClassName
                      ? Math.max(1, selectedLayoutGroup)
                      : 0;
                    const nextUsedAreas = new Set(
                      sectionItems.flatMap((item) =>
                        item.id !== initialValues.id &&
                        item.isVisible &&
                        nextGroup > 0 &&
                        item.layoutGroup === nextGroup &&
                        item.layoutAreaClassName
                          ? [item.layoutAreaClassName]
                          : [],
                      ),
                    );
                    const nextAreaOption =
                      nextTemplate.areaOptions.find(
                        (option) =>
                          !option.value || !nextUsedAreas.has(option.value),
                      ) ?? nextTemplate.areaOptions[0];

                    setValue('layoutGroup', String(nextGroup), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setValue(
                      'layoutGroupClassName',
                      nextTemplate.layoutGroupClassName,
                      { shouldDirty: true, shouldValidate: true },
                    );
                    setValue(
                      'layoutAreaClassName',
                      nextAreaOption?.value ?? '',
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                >
                  {HOME_LAYOUT_OPTIONS.map((template) => (
                    <option
                      key={template.layoutGroupClassName || 'none'}
                      value={template.layoutGroupClassName}
                    >
                      {t(`layout.${template.labelKey}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                {t('cardForm.cardPosition')}
                <select
                  className={inputClass}
                  {...register('layoutAreaClassName')}
                >
                  {selectedLayoutTemplate.areaOptions.map((option) => (
                    <option
                      key={option.value || 'default'}
                      value={option.value}
                      disabled={
                        enforceCarouselLayout &&
                        Boolean(option.value) &&
                        usedLayoutAreas.has(option.value)
                      }
                    >
                      {t(`layout.${option.labelKey}`)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p
              className={cn(
                'text-xs font-semibold',
                isSelectedLayoutFull ||
                  isSelectedLayoutAreaUsed ||
                  isSelectedLayoutPresetConflict
                  ? 'text-danger'
                  : 'text-muted dark:text-dark-muted',
              )}
            >
              {isSelectedLayoutPresetConflict
                ? t('cardForm.presetConflict')
                : isSelectedLayoutAreaUsed
                  ? t('cardForm.areaUsed')
                  : isSelectedLayoutFull
                    ? t('cardForm.layoutFull', {
                        preset: t(`layout.${selectedLayoutTemplate.labelKey}`),
                      })
                    : layoutHelperText}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                {t('cardForm.imageFit')}
                <select className={inputClass} {...register('imageClassName')}>
                  {IMAGE_FIT_OPTIONS.map((option) => (
                    <option
                      key={option.value || 'default'}
                      value={option.value}
                    >
                      {t(`layout.${option.labelKey}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                {t('cardForm.labelPosition')}
                <select className={inputClass} {...register('labelPosition')}>
                  <option value="">{t('layout.default')}</option>
                  <option value="top">{t('layout.labelTop')}</option>
                  <option value="bottom">{t('layout.labelBottom')}</option>
                </select>
              </label>
            </div>
          </div>
        </details>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" {...register('isVisible')} />
          {t('cardForm.visible')}
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          {initialValues.id ? t('cardForm.save') : t('cardForm.add')}
        </button>
      </div>
    </form>
  );
}

function TargetFields({
  targetType,
  targetCategoryId,
  targetProductId,
  href,
  categories,
  products,
  register,
  setValue,
}: {
  targetType: HomeSectionItemFormState['targetType'];
  targetCategoryId: string;
  targetProductId: string;
  href: string;
  categories: AdminHomeCategory[];
  products: AdminHomeProduct[];
  register: UseFormRegister<HomeSectionItemFormState>;
  setValue: UseFormSetValue<HomeSectionItemFormState>;
}) {
  const locale = useLocale();
  const t = useTranslations('AdminHome.target');
  const selectedCategory = categories.find(
    (category) => String(category.id) === targetCategoryId,
  );
  const selectedProduct = products.find(
    (product) => String(product.id) === targetProductId,
  );
  const hrefPreview =
    targetType === 'product' && selectedProduct
      ? getProductHref({
          categorySlug: selectedProduct.category.slug,
          productSlug: selectedProduct.slug,
        })
      : targetType === 'category' && selectedCategory
        ? getCategoryHref(selectedCategory.slug)
        : targetType === 'custom'
          ? href
          : '';

  return (
    <div className="grid gap-4 rounded-md border border-line p-3 dark:border-dark-border">
      <label className={labelClass}>
        {t('title')}
        <select
          className={inputClass}
          {...register('targetType')}
          onChange={(event) => {
            setValue(
              'targetType',
              event.target.value as HomeSectionItemFormState['targetType'],
              { shouldDirty: true, shouldValidate: true },
            );
            setValue('href', '', {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('targetCategoryId', '', {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('targetProductId', '', {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
        >
          <option value="category">{t('category')}</option>
          <option value="product">{t('product')}</option>
          <option value="custom">{t('custom')}</option>
          <option value="none">{t('none')}</option>
        </select>
      </label>
      {targetType === 'category' ? (
        <label className={labelClass}>
          {t('category')}
          <select className={inputClass} {...register('targetCategoryId')}>
            <option value="">{t('selectCategory')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {getLocalizedName(category, locale)} ({category.slug})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" {...register('targetCategoryId')} />
      )}
      {targetType === 'product' ? (
        <label className={labelClass}>
          {t('product')}
          <select className={inputClass} {...register('targetProductId')}>
            <option value="">{t('selectProduct')}</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {getLocalizedName(product, locale)} ({product.slug})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" {...register('targetProductId')} />
      )}
      {targetType === 'custom' ? (
        <label className={labelClass}>
          {t('customUrl')}
          <input className={inputClass} {...register('href')} />
        </label>
      ) : (
        <input type="hidden" {...register('href')} />
      )}
      {hrefPreview ? (
        <p className="text-xs font-semibold text-muted dark:text-dark-muted">
          {t('pathPreview', { path: hrefPreview })}
        </p>
      ) : null}
    </div>
  );
}

function getItemHrefPreview(item: AdminHomeSectionItem) {
  if (item.targetProduct) {
    return getProductHref({
      categorySlug: item.targetProduct.category.slug,
      productSlug: item.targetProduct.slug,
    });
  }

  if (item.targetCategory) {
    return getCategoryHref(item.targetCategory.slug);
  }

  return item.href ?? '-';
}
