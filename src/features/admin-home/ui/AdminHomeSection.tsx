import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction, SubmitEvent } from 'react';

import {
  IconDeviceFloppy,
  IconPencil,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react';

import {
  ImageUrlList,
  PaginationControls,
  SectionTitle,
  TableHeader,
  TextArea,
  TextInput,
  inputClass,
  labelClass,
} from '@pages/admin/ui/shared/AdminControls';

import {
  getCategoryHref,
  getProductHref,
} from '@shared/lib/routes/productRoutes';
import { cn } from '@shared/lib/utils/style';

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
  HomeSectionFormState,
  HomeSectionItemFormState,
} from '../model/types';

const EMPTY_SECTIONS: AdminHomeSectionType[] = [];
const EMPTY_CATEGORIES: AdminHomeCategory[] = [];
const EMPTY_PRODUCTS: AdminHomeProduct[] = [];
const ADMIN_HOME_LIST_PAGE_SIZE = 10;
const HOME_LAYOUT_DISABLED_PRESET = {
  label: '사용 안 함',
  layoutGroupClassName: '',
  areaOptions: [{ label: '기본', value: '' }],
} as const;
const HOME_LAYOUT_PRESETS = [
  {
    label: '3열 균등형',
    layoutGroupClassName: 'lg:grid-areas-home-3',
    areaOptions: [
      { label: '왼쪽 카드', value: 'lg:grid-in-j' },
      { label: '가운데 카드', value: 'lg:grid-in-k' },
      { label: '오른쪽 카드', value: 'lg:grid-in-l' },
    ],
  },
];
const HOME_LAYOUT_OPTIONS = [
  HOME_LAYOUT_DISABLED_PRESET,
  ...HOME_LAYOUT_PRESETS,
];
const IMAGE_FIT_OPTIONS = [
  { label: '기본', value: '' },
  { label: '영역을 꽉 채움', value: 'object-cover' },
  { label: '이미지 전체 표시', value: 'object-contain' },
];

const getLayoutTemplateLimit = (
  template: (typeof HOME_LAYOUT_OPTIONS)[number],
) => template.areaOptions.filter((option) => option.value).length;

const getLayoutTemplate = (form: HomeSectionItemFormState) =>
  HOME_LAYOUT_OPTIONS.find(
    (template) => template.layoutGroupClassName === form.layoutGroupClassName,
  ) ?? HOME_LAYOUT_DISABLED_PRESET;

type AdminHomeSectionProps = {
  data?: AdminHomePayload;
  isPending: boolean;
  canWriteAdmin: boolean;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
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
  const sections = data?.sections ?? EMPTY_SECTIONS;
  const categories = data?.categories ?? EMPTY_CATEGORIES;
  const products = data?.products ?? EMPTY_PRODUCTS;
  const updateSectionMutation = useUpdateAdminHomeSectionMutation();
  const saveItemMutation = useSaveAdminHomeSectionItemMutation();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(
    null,
  );
  const [sectionForm, setSectionForm] = useState<HomeSectionFormState | null>(
    null,
  );
  const [itemForm, setItemForm] = useState<HomeSectionItemFormState | null>(
    null,
  );
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
      setSectionForm(null);
      setItemForm(null);
      return;
    }

    setSelectedSectionId(selectedSection.id);
    setSectionForm(createHomeSectionForm(selectedSection));
    setItemForm((prev) => {
      const selectedItem =
        selectedSection.items.find((item) => item.id === prev?.id) ??
        selectedSection.items[0];

      return selectedItem ? createHomeSectionItemForm(selectedItem) : null;
    });
  }, [selectedSection]);

  const handleSectionSelect = (section: AdminHomeSectionType) => {
    setSelectedSectionId(section.id);
    setSectionForm(createHomeSectionForm(section));
    setItemForm(
      section.items[0] ? createHomeSectionItemForm(section.items[0]) : null,
    );
  };

  const handleSectionSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!sectionForm) {
      return;
    }

    try {
      const savedSection = await updateSectionMutation.mutateAsync(sectionForm);
      onMessage(`홈 섹션 수정 완료: ${savedSection.title}`);
    } catch (error) {
      onError(error instanceof Error ? error.message : '홈 섹션 수정 실패');
    }
  };

  const handleItemSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canWriteAdmin) {
      onReadOnlyAction();
      return;
    }

    if (!itemForm) {
      return;
    }

    try {
      const action = itemForm.id ? '수정' : '추가';
      const savedItem = await saveItemMutation.mutateAsync(itemForm);
      setItemForm(createHomeSectionItemForm(savedItem));
      onMessage(`홈 카드 ${action} 완료: ${savedItem.title}`);
    } catch (error) {
      onError(error instanceof Error ? error.message : '홈 카드 저장 실패');
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

    setItemForm(
      createEmptyHomeSectionItemForm(selectedSection.id, nextDisplayOrder),
    );
  };

  if (isPending) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-muted dark:text-dark-muted">
        홈 섹션 데이터를 불러오고 있습니다.
      </div>
    );
  }

  if (!selectedSection || !sectionForm) {
    return (
      <div className="rounded-md border border-line bg-surface p-8 text-center text-sm font-semibold text-muted dark:border-dark-border dark:bg-dark-panel dark:text-dark-muted">
        등록된 홈 섹션이 없습니다.
      </div>
    );
  }

  const isCategoryCarouselSection = selectedSection.key === 'category-carousel';

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <div className="order-2 grid content-start gap-6 xl:order-1">
        <HomeSectionForm
          form={sectionForm}
          isSaving={isSaving}
          setForm={setSectionForm}
          onSubmit={handleSectionSubmit}
          onReset={() => setSectionForm(createHomeSectionForm(selectedSection))}
        />
        {itemForm ? (
          <HomeSectionItemForm
            form={itemForm}
            categories={categories}
            products={products}
            sectionItems={selectedSection.items}
            enforceCarouselLayout={isCategoryCarouselSection}
            isSaving={isSaving}
            setForm={setItemForm}
            onSubmit={handleItemSubmit}
            onReset={() => {
              if (!itemForm.id) {
                setItemForm(
                  createEmptyHomeSectionItemForm(
                    selectedSection.id,
                    Number(itemForm.displayOrder || 0),
                  ),
                );
                return;
              }

              const selectedItem = selectedSection.items.find(
                (item) => item.id === itemForm.id,
              );

              if (selectedItem) {
                setItemForm(createHomeSectionItemForm(selectedItem));
              }
            }}
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
          selectedItemId={itemForm?.id ?? null}
          isSaving={isSaving}
          onCreate={handleCreateItem}
          onEdit={(item) => setItemForm(createHomeSectionItemForm(item))}
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
      <TableHeader title="홈 섹션" count={sections.length} />
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
            <p className="text-sm font-bold">{section.title}</p>
            <p className="mt-1 text-xs text-muted dark:text-dark-muted">
              {section.key} / 카드 {section.items.length.toLocaleString()}개
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
  form,
  isSaving,
  setForm,
  onSubmit,
  onReset,
}: {
  form: HomeSectionFormState;
  isSaving: boolean;
  setForm: Dispatch<SetStateAction<HomeSectionFormState | null>>;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title="섹션 수정"
        action={
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconRefresh size={16} />
            새로고침
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <TextInput
          label="섹션 라벨"
          value={form.eyebrow}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, eyebrow: value } : prev))
          }
        />
        <TextInput
          label="제목"
          value={form.title}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, title: value } : prev))
          }
          required
        />
        <TextArea
          label="부제"
          value={form.subtitle}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, subtitle: value } : prev))
          }
        />
        <TextInput
          label="노출 순서"
          type="number"
          min={0}
          value={form.displayOrder}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, displayOrder: value } : prev))
          }
        />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) =>
              setForm((prev) =>
                prev ? { ...prev, isVisible: event.target.checked } : prev,
              )
            }
          />
          홈에 노출
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          섹션 저장
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
          <h2 className="font-bold">홈 카드</h2>
          <span className="text-sm font-semibold text-muted dark:text-dark-muted">
            {items.length.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          disabled={isSaving}
          onClick={onCreate}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
        >
          <IconPlus size={16} />
          카드 추가
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
              <th className="px-3 py-3">순서</th>
              <th className="px-3 py-3">제목</th>
              <th className="px-3 py-3">연결</th>
              <th className="px-3 py-3">이미지</th>
              <th className="px-3 py-3">관리</th>
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
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {item.isVisible ? '노출' : '숨김'} / {item.label ?? '-'}
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
                    수정
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
  form,
  categories,
  products,
  sectionItems,
  enforceCarouselLayout,
  isSaving,
  setForm,
  onSubmit,
  onReset,
}: {
  form: HomeSectionItemFormState;
  categories: AdminHomeCategory[];
  products: AdminHomeProduct[];
  sectionItems: AdminHomeSectionItem[];
  enforceCarouselLayout: boolean;
  isSaving: boolean;
  setForm: Dispatch<SetStateAction<HomeSectionItemFormState | null>>;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) {
  const selectedLayoutTemplate = getLayoutTemplate(form);
  const selectedLayoutGroup = Number(form.layoutGroup || 0);
  const selectedLayoutLimit = getLayoutTemplateLimit(selectedLayoutTemplate);
  const visibleItemsInSelectedGroup = sectionItems.filter(
    (item) =>
      item.id !== form.id &&
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
    form.isVisible &&
    selectedLayoutGroup > 0 &&
    selectedLayoutLimit > 0 &&
    visibleItemsInSelectedGroup.length >= selectedLayoutLimit;
  const isSelectedLayoutAreaUsed =
    enforceCarouselLayout &&
    form.isVisible &&
    selectedLayoutGroup > 0 &&
    Boolean(form.layoutAreaClassName) &&
    usedLayoutAreas.has(form.layoutAreaClassName);
  const isSelectedLayoutPresetConflict =
    enforceCarouselLayout &&
    form.isVisible &&
    selectedLayoutGroup > 0 &&
    Boolean(existingLayoutClassNameInSelectedGroup) &&
    existingLayoutClassNameInSelectedGroup !== form.layoutGroupClassName;
  const layoutHelperText =
    selectedLayoutGroup === 0
      ? '사용 안 함은 데이터를 저장하지만 categories 캐러셀에는 표시하지 않습니다.'
      : `캐러셀 ${selectedLayoutGroup}페이지 / ${selectedLayoutTemplate.label}: ${visibleItemsInSelectedGroup.length}/${selectedLayoutLimit}개 사용 중`;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title={form.id ? '카드 수정' : '카드 추가'}
        action={
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconRefresh size={16} />
            새로고침
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label="라벨"
            value={form.label}
            onChange={(value) =>
              setForm((prev) => (prev ? { ...prev, label: value } : prev))
            }
          />
          <TextInput
            label="노출 순서"
            type="number"
            min={0}
            value={form.displayOrder}
            onChange={(value) =>
              setForm((prev) =>
                prev ? { ...prev, displayOrder: value } : prev,
              )
            }
          />
        </div>
        <TextInput
          label="제목"
          value={form.title}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, title: value } : prev))
          }
          required
        />
        <TextArea
          label="설명"
          value={form.description}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, description: value } : prev))
          }
        />
        <TextInput
          label="CTA"
          value={form.cta}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, cta: value } : prev))
          }
        />
        <TextInput
          label="이미지 URL"
          value={form.image_url}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, image_url: value } : prev))
          }
          required
        />
        <TextInput
          label="이미지 대체 텍스트"
          value={form.imageAlt}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, imageAlt: value } : prev))
          }
        />
        <TargetFields
          form={form}
          categories={categories}
          products={products}
          setForm={setForm}
        />
        <details className="rounded-md border border-line p-3 dark:border-dark-border">
          <summary className="cursor-pointer text-sm font-bold">
            레이아웃 옵션
          </summary>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                캐러셀 페이지 번호
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.layoutGroup}
                  onChange={(event) => {
                    const nextGroup = Math.max(
                      0,
                      Number(event.target.value || 0),
                    );
                    const existingItemInNextGroup = sectionItems.find(
                      (item) =>
                        item.id !== form.id &&
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
                        item.id !== form.id &&
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

                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            layoutGroup: String(nextGroup),
                            layoutGroupClassName:
                              nextTemplate.layoutGroupClassName,
                            layoutAreaClassName: nextAreaOption?.value ?? '',
                          }
                        : prev,
                    );
                  }}
                />
              </label>
              <label className={labelClass}>
                레이아웃 프리셋
                <select
                  className={inputClass}
                  value={selectedLayoutTemplate.layoutGroupClassName}
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
                        item.id !== form.id &&
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

                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            layoutGroup: String(nextGroup),
                            layoutGroupClassName:
                              nextTemplate.layoutGroupClassName,
                            layoutAreaClassName: nextAreaOption?.value ?? '',
                          }
                        : prev,
                    );
                  }}
                >
                  {HOME_LAYOUT_OPTIONS.map((template) => (
                    <option
                      key={template.layoutGroupClassName || 'none'}
                      value={template.layoutGroupClassName}
                    >
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                카드 위치
                <select
                  className={inputClass}
                  value={form.layoutAreaClassName}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, layoutAreaClassName: event.target.value }
                        : prev,
                    )
                  }
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
                      {option.label}
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
                ? '같은 캐러셀 페이지에는 하나의 레이아웃 프리셋만 사용할 수 있습니다.'
                : isSelectedLayoutAreaUsed
                  ? '이미 사용 중인 카드 위치입니다. 다른 위치를 선택해주세요.'
                  : isSelectedLayoutFull
                    ? `${selectedLayoutTemplate.label}에 더 이상 카드를 추가할 수 없습니다.`
                    : layoutHelperText}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={labelClass}>
                이미지 맞춤
                <select
                  className={inputClass}
                  value={form.imageClassName}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, imageClassName: event.target.value }
                        : prev,
                    )
                  }
                >
                  {IMAGE_FIT_OPTIONS.map((option) => (
                    <option
                      key={option.value || 'default'}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                라벨 위치
                <select
                  className={inputClass}
                  value={form.labelPosition}
                  onChange={(event) =>
                    setForm((prev) =>
                      prev
                        ? { ...prev, labelPosition: event.target.value }
                        : prev,
                    )
                  }
                >
                  <option value="">기본</option>
                  <option value="top">상단</option>
                  <option value="bottom">하단</option>
                </select>
              </label>
            </div>
          </div>
        </details>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(event) =>
              setForm((prev) =>
                prev ? { ...prev, isVisible: event.target.checked } : prev,
              )
            }
          />
          홈에 노출
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          {form.id ? '카드 저장' : '카드 추가'}
        </button>
      </div>
    </form>
  );
}

function TargetFields({
  form,
  categories,
  products,
  setForm,
}: {
  form: HomeSectionItemFormState;
  categories: AdminHomeCategory[];
  products: AdminHomeProduct[];
  setForm: Dispatch<SetStateAction<HomeSectionItemFormState | null>>;
}) {
  const selectedCategory = categories.find(
    (category) => String(category.id) === form.targetCategoryId,
  );
  const selectedProduct = products.find(
    (product) => String(product.id) === form.targetProductId,
  );
  const hrefPreview =
    form.targetType === 'product' && selectedProduct
      ? getProductHref({
          categorySlug: selectedProduct.category.slug,
          productSlug: selectedProduct.slug,
        })
      : form.targetType === 'category' && selectedCategory
        ? getCategoryHref(selectedCategory.slug)
        : form.targetType === 'custom'
          ? form.href
          : '';

  return (
    <div className="grid gap-4 rounded-md border border-line p-3 dark:border-dark-border">
      <label className={labelClass}>
        연결 대상
        <select
          className={inputClass}
          value={form.targetType}
          onChange={(event) =>
            setForm((prev) =>
              prev
                ? {
                    ...prev,
                    targetType: event.target.value as typeof form.targetType,
                    href: '',
                    targetCategoryId: '',
                    targetProductId: '',
                  }
                : prev,
            )
          }
        >
          <option value="category">카테고리</option>
          <option value="product">상품</option>
          <option value="custom">직접 입력 URL</option>
          <option value="none">없음</option>
        </select>
      </label>
      {form.targetType === 'category' ? (
        <label className={labelClass}>
          카테고리
          <select
            className={inputClass}
            value={form.targetCategoryId}
            onChange={(event) =>
              setForm((prev) =>
                prev ? { ...prev, targetCategoryId: event.target.value } : prev,
              )
            }
          >
            <option value="">카테고리 선택</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_ko} ({category.slug})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {form.targetType === 'product' ? (
        <label className={labelClass}>
          상품
          <select
            className={inputClass}
            value={form.targetProductId}
            onChange={(event) =>
              setForm((prev) =>
                prev ? { ...prev, targetProductId: event.target.value } : prev,
              )
            }
          >
            <option value="">상품 선택</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name_ko ?? product.name_en} ({product.slug})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {form.targetType === 'custom' ? (
        <TextInput
          label="직접 입력 URL"
          value={form.href}
          onChange={(value) =>
            setForm((prev) => (prev ? { ...prev, href: value } : prev))
          }
        />
      ) : null}
      {hrefPreview ? (
        <p className="text-xs font-semibold text-muted dark:text-dark-muted">
          적용 경로: {hrefPreview}
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
