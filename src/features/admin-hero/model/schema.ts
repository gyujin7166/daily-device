import { z } from 'zod';

import { routing } from '@shared/config/i18n/routing';

const heroToneSchema = z.enum(['light', 'dark']);
const heroOverlayToneSchema = z.enum(['none', 'dark', 'light']);
const heroPositionSchema = z.enum(['start', 'center', 'end']);
const localeSchema = z.enum(routing.locales);

const positiveIntegerStringSchema = z.string().refine((value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
});

const optionalPositiveIntegerStringSchema = z.string().refine((value) => {
  if (value === '') {
    return true;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
});

const heroTranslationFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  detailed_description: z.string(),
});

/**
 * RHF는 input의 문자열 값을 그대로 관리하고 API 경계에서 숫자/null로 변환한다.
 * 서버 body schema와 별도로 UI 상태의 형태와 숫자 문자열만 검증한다.
 */
export const adminHeroFormSchema = z.object({
  id: z.number().int().positive().nullable(),
  name_en: z.string(),
  name_ko: z.string(),
  heroTypeId: positiveIntegerStringSchema,
  targetCategoryId: z.union([z.literal(''), positiveIntegerStringSchema]),
  image_url: z.string(),
  image_width: optionalPositiveIntegerStringSchema,
  image_height: optionalPositiveIntegerStringSchema,
  description: z.string(),
  detailed_description: z.string(),
  position: heroPositionSchema,
  isDefault: z.boolean(),
  textTone: heroToneSchema,
  navTone: heroToneSchema,
  overlayTone: heroOverlayToneSchema,
  translations: z.object({
    ko: heroTranslationFormSchema,
    en: heroTranslationFormSchema,
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

export const adminHeroBodySchema = z.object({
  name_en: z.string().trim().min(1),
  name_ko: z.string().trim().min(1),
  heroTypeId: z.coerce.number().int().positive(),
  targetCategoryId: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  image_url: z.preprocess(emptyToNull, z.string().trim().nullable()),
  image_width: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  image_height: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  detailed_description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  position: heroPositionSchema.default('center'),
  isDefault: z.boolean().default(false),
  textTone: heroToneSchema.default('dark'),
  navTone: heroToneSchema.default('light'),
  overlayTone: heroOverlayToneSchema.default('none'),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        name: z.string().trim().min(1),
        description: z.preprocess(emptyToNull, z.string().trim().nullable()),
        detailed_description: z.preprocess(
          emptyToNull,
          z.string().trim().nullable(),
        ),
      }),
    )
    .default([]),
});
