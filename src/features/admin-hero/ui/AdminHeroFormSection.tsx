import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { SubmitEvent } from 'react';

import {
  IconDeviceFloppy,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react';

import {
  SectionTitle,
  TextArea,
  TextInput,
  inputClass,
  labelClass,
} from '@pages/admin/ui/shared/AdminControls';

import { uploadCloudinaryImage } from '@shared/lib/cloudinary/uploadImage';
import { getCategoryHref } from '@shared/lib/routes/productRoutes';
import Spinner from '@shared/ui/Loading/Spinner/Spinner';

import { getAdminHeroTypeLabel } from '../model/types';

import type {
  AdminHeroCategory,
  AdminHeroType,
  HeroOverlayTone,
  HeroPosition,
  HeroTone,
  HeroFormState,
} from '../model/types';

const HERO_POSITION_OPTIONS: Array<{ label: string; value: HeroPosition }> = [
  { label: '왼쪽', value: 'start' },
  { label: '가운데', value: 'center' },
  { label: '오른쪽', value: 'end' },
];

const HERO_TONE_OPTIONS: Array<{ label: string; value: HeroTone }> = [
  { label: '밝은 글자', value: 'light' },
  { label: '어두운 글자', value: 'dark' },
];

const HERO_OVERLAY_TONE_OPTIONS: Array<{
  label: string;
  value: HeroOverlayTone;
}> = [
  { label: '사용 안 함', value: 'none' },
  { label: '어둡게', value: 'dark' },
  { label: '밝게', value: 'light' },
];

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
      setUploadError('Hero 타입을 먼저 선택해주세요.');
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
      setUploadError(
        error instanceof Error
          ? error.message
          : 'Hero 이미지 업로드에 실패했습니다.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-md border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel"
    >
      <SectionTitle
        title={form.id ? 'Hero 수정' : 'Hero 추가'}
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
          label="한글 이름"
          value={form.name_ko}
          onChange={(value) => setForm((prev) => ({ ...prev, name_ko: value }))}
          required
        />
        <label className={labelClass}>
          타입
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
                {getAdminHeroTypeLabel(type.name)}
                {isHeroTypeDisabled(type) ? ' (선택 불가)' : ''}
              </option>
            ))}
          </select>
          {selectedHeroPath ? (
            <span className="text-xs font-normal text-muted dark:text-dark-muted">
              적용 경로: {selectedHeroPath}
            </span>
          ) : null}
        </label>
        {isProductHero ? (
          <label className={labelClass}>
            적용 카테고리
            <select
              className={inputClass}
              value={form.targetCategoryId}
              onChange={(event) => onTargetCategoryChange(event.target.value)}
              required
            >
              <option value="">카테고리 선택</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_ko} ({category.name_en})
                </option>
              ))}
            </select>
            {selectedTargetCategory ? (
              <span className="text-xs font-normal text-muted dark:text-dark-muted">
                적용 경로: {getCategoryHref(selectedTargetCategory.slug)}
              </span>
            ) : null}
          </label>
        ) : (
          <TextInput
            label="영문 이름"
            value={form.name_en}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, name_en: value }))
            }
            required
          />
        )}
        <TextInput
          label="이미지 URL"
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
            {isUploading ? '업로드 중' : 'Hero 이미지 업로드'}
          </label>
          {uploadError ? (
            <p className="text-xs font-semibold text-danger">{uploadError}</p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            label="이미지 너비"
            type="number"
            value={form.image_width}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image_width: value }))
            }
          />
          <TextInput
            label="이미지 높이"
            type="number"
            value={form.image_height}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, image_height: value }))
            }
          />
        </div>
        <label className={labelClass}>
          위치
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
                {option.label}
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
          기본 Hero 이미지로 사용
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={labelClass}>
            문구 색상
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
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            네비바 색상
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
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            오버레이
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
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextArea
          label="설명"
          value={form.description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, description: value }))
          }
        />
        <TextArea
          label="상세 설명"
          value={form.detailed_description}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, detailed_description: value }))
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
          저장
        </button>
      </div>
    </form>
  );
}
