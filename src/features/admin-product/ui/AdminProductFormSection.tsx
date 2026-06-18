import type { Dispatch, SetStateAction } from 'react';
import type { SubmitEvent } from 'react';

import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

import {
  SectionTitle,
  TextArea,
  TextInput,
  inputClass,
  labelClass,
} from '@pages/admin/ui/shared/AdminControls';

import { PRODUCT_LINE_OPTIONS } from '@shared/constants/productLine';
import type { ProductLineValue } from '@shared/constants/productLine';

import AdminProductColorFields from './AdminProductColorFields';
import AdminProductImageFields from './AdminProductImageFields';

import type {
  AdminColor,
  ProductCategory,
  ProductFormState,
} from '../model/types';

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
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title={form.id ? '상품 수정' : '상품 추가'}
        action={
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold dark:border-dark-border"
          >
            <IconPlus size={16} />
            신규
          </button>
        }
      />
      <div className="mt-5 grid gap-4">
        <TextInput
          label="영문 이름"
          value={form.name_en}
          onChange={(value) => setForm((prev) => ({ ...prev, name_en: value }))}
          required
        />
        <TextInput
          label="슬러그"
          value={form.slug}
          onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))}
          required
        />
        <TextInput
          label="한글 이름"
          value={form.name_ko}
          onChange={(value) => setForm((prev) => ({ ...prev, name_ko: value }))}
        />
        <TextInput
          label="검색 키워드"
          value={form.search_keyword}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, search_keyword: value }))
          }
          required
        />
        <TextInput
          label="가격"
          type="number"
          value={form.price}
          onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
          required
        />
        <TextInput
          label="할인율(%)"
          type="number"
          value={form.discountRate}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, discountRate: value }))
          }
        />
        <label className={labelClass}>
          카테고리
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
                {category.name_ko}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          제품 라인
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
            <option value="">선택 안 함</option>
            {PRODUCT_LINE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <AdminProductColorFields
          form={form}
          colors={colors}
          selectedFormColors={selectedFormColors}
          setForm={setForm}
          onToggleColor={onToggleColor}
        />
        <AdminProductImageFields
          images={form.images}
          categoryId={form.categoryId}
          productSlug={form.slug}
          selectedFormColors={selectedFormColors}
          onAddImage={onAddImage}
          onUpdateImage={onUpdateImage}
          onUpdateImageOrder={onUpdateImageOrder}
          onRemoveImage={onRemoveImage}
        />
        <TextArea
          label="설명"
          value={form.description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, description: value }))
          }
          required
        />
        <TextArea
          label="상세 설명"
          value={form.detailed_description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, detailed_description: value }))
          }
        />
        <TextArea
          label="비고"
          value={form.note}
          onChange={(value) => setForm((prev) => ({ ...prev, note: value }))}
        />
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-surface transition hover:bg-primary-hover disabled:opacity-60"
        >
          <IconDeviceFloppy size={18} />
          저장
        </button>
      </div>
    </form>
  );
}
