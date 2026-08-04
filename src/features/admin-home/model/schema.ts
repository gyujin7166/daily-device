import { z } from 'zod';

import { routing } from '@shared/config/i18n/routing';

const localeSchema = z.enum(routing.locales);

const positiveIntegerStringSchema = z.string().refine((value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
});

const optionalPositiveIntegerStringSchema = z.union([
  z.literal(''),
  positiveIntegerStringSchema,
]);

const optionalNonnegativeIntegerStringSchema = z.string().refine((value) => {
  if (value === '') {
    return true;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0;
});

const homeSectionTranslationFormSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
});

const homeSectionItemTranslationFormSchema = z.object({
  label: z.string(),
  title: z.string(),
  description: z.string(),
  cta: z.string(),
  imageAlt: z.string(),
});

/** RHF에서 관리하는 홈 섹션 UI 상태의 문자열 형태를 검증한다. */
export const adminHomeSectionFormSchema = z.object({
  id: z.number().int().positive(),
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  displayOrder: optionalNonnegativeIntegerStringSchema,
  isVisible: z.boolean(),
  translations: z.object({
    ko: homeSectionTranslationFormSchema,
    en: homeSectionTranslationFormSchema,
  }),
});

/** RHF에서 관리하는 홈 카드 UI 상태와 target 선택값을 검증한다. */
export const adminHomeSectionItemFormSchema = z.object({
  id: z.number().int().positive().nullable(),
  sectionId: z.number().int().positive(),
  targetType: z.enum(['category', 'product', 'custom', 'none']),
  label: z.string(),
  title: z.string(),
  description: z.string(),
  cta: z.string(),
  href: z.string(),
  targetCategoryId: optionalPositiveIntegerStringSchema,
  targetProductId: optionalPositiveIntegerStringSchema,
  image_url: z.string(),
  imageAlt: z.string(),
  displayOrder: optionalNonnegativeIntegerStringSchema,
  isVisible: z.boolean(),
  layoutGroup: optionalNonnegativeIntegerStringSchema,
  layoutGroupClassName: z.string(),
  layoutAreaClassName: z.string(),
  labelPosition: z.string(),
  imageClassName: z.string(),
  translations: z.object({
    ko: homeSectionItemTranslationFormSchema,
    en: homeSectionItemTranslationFormSchema,
  }),
});

/**
 * 관리자 폼은 선택 해제 값을 빈 문자열로 보내는 경우가 많다.
 * DB nullable 필드와 schema 타입을 맞추기 위해 API 입력에서 null로 정규화한다.
 */
const emptyToNull = (value: unknown) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  return value;
};

export const adminHomeSectionBodySchema = z.object({
  eyebrow: z.preprocess(emptyToNull, z.string().trim().nullable()),
  title: z.string().trim().min(1),
  subtitle: z.preprocess(emptyToNull, z.string().trim().nullable()),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isVisible: z.boolean().default(true),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        eyebrow: z.preprocess(emptyToNull, z.string().trim().nullable()),
        title: z.string().trim().min(1),
        subtitle: z.preprocess(emptyToNull, z.string().trim().nullable()),
      }),
    )
    .default([]),
});

export const adminHomeSectionItemBodySchema = z.object({
  label: z.preprocess(emptyToNull, z.string().trim().nullable()),
  title: z.string().trim().min(1),
  description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  cta: z.preprocess(emptyToNull, z.string().trim().nullable()),
  href: z.preprocess(emptyToNull, z.string().trim().nullable()),
  targetCategoryId: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  targetProductId: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  image_url: z.string().trim().min(1),
  imageAlt: z.preprocess(emptyToNull, z.string().trim().nullable()),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isVisible: z.boolean().default(true),
  layoutGroup: z.coerce.number().int().nonnegative().default(0),
  layoutGroupClassName: z.preprocess(emptyToNull, z.string().trim().nullable()),
  layoutAreaClassName: z.preprocess(emptyToNull, z.string().trim().nullable()),
  labelPosition: z.preprocess(
    emptyToNull,
    z.enum(['top', 'bottom']).nullable(),
  ),
  imageClassName: z.preprocess(emptyToNull, z.string().trim().nullable()),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        label: z.preprocess(emptyToNull, z.string().trim().nullable()),
        title: z.string().trim().min(1),
        description: z.preprocess(emptyToNull, z.string().trim().nullable()),
        cta: z.preprocess(emptyToNull, z.string().trim().nullable()),
        imageAlt: z.preprocess(emptyToNull, z.string().trim().nullable()),
      }),
    )
    .default([]),
});

export const adminHomeSectionItemCreateBodySchema =
  adminHomeSectionItemBodySchema.extend({
    sectionId: z.coerce.number().int().positive(),
  });
