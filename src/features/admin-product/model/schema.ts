import { z } from 'zod';

import { routing } from '@shared/config/i18n/routing';
import { PRODUCT_LINE_VALUES } from '@shared/constants/productLine';

const localeSchema = z.enum(routing.locales);

const positiveIntegerStringSchema = z.string().refine((value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
});

const optionalPositiveIntegerStringSchema = z.union([
  z.literal(''),
  positiveIntegerStringSchema,
]);

const nonnegativeNumberStringSchema = z.string().refine((value) => {
  if (value === '') {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
});

const optionalPercentageStringSchema = z.string().refine((value) => {
  if (value === '') {
    return true;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100;
});

const optionalNonnegativeIntegerStringSchema = z.string().refine((value) => {
  if (value === '') {
    return true;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0;
});

const productTranslationFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  detailed_description: z.string(),
  note: z.string(),
});

/**
 * RHF는 input 값을 문자열로 유지하고 API 경계에서 숫자/null로 변환한다.
 * 서버 body schema와 별도로 동적 이미지 배열을 포함한 UI 상태만 검증한다.
 */
export const adminProductFormSchema = z.object({
  id: z.number().int().positive().nullable(),
  name_en: z.string(),
  slug: z.string(),
  name_ko: z.string(),
  search_keyword: z.string(),
  description: z.string(),
  detailed_description: z.string(),
  note: z.string(),
  price: nonnegativeNumberStringSchema,
  discountRate: optionalPercentageStringSchema,
  productLine: z.union([z.literal(''), z.enum(PRODUCT_LINE_VALUES)]),
  categoryId: positiveIntegerStringSchema,
  colorIds: z.array(positiveIntegerStringSchema),
  defaultColorId: optionalPositiveIntegerStringSchema,
  images: z.array(
    z.object({
      id: z.number().int().positive().nullable(),
      image_url: z.string(),
      colorId: optionalPositiveIntegerStringSchema,
      order: optionalNonnegativeIntegerStringSchema,
      isMain: z.boolean(),
    }),
  ),
  translations: z.object({
    ko: productTranslationFormSchema,
    en: productTranslationFormSchema,
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

/**
 * query string은 누락과 빈 문자열을 구분하기 어렵다.
 * optional/default schema가 정상 동작하도록 빈 값을 undefined로 바꾼다.
 */
const emptyToUndefined = (value: unknown) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined;
  }

  return value;
};

export const adminProductBodySchema = z.object({
  name_en: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name_ko: z.preprocess(emptyToNull, z.string().trim().nullable()),
  search_keyword: z.string().trim().min(1),
  description: z.string().trim().min(1),
  detailed_description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  note: z.preprocess(emptyToNull, z.string().trim().nullable()),
  price: z.coerce.number().nonnegative(),
  discountRate: z.coerce.number().int().min(0).max(100).default(0),
  productLine: z.preprocess(
    emptyToNull,
    z.enum(PRODUCT_LINE_VALUES).nullable(),
  ),
  categoryId: z.coerce.number().int().positive(),
  colorIds: z.array(z.coerce.number().int().positive()).default([]),
  defaultColorId: z.preprocess(
    emptyToNull,
    z.coerce.number().int().positive().nullable(),
  ),
  images: z
    .array(
      z.object({
        id: z.coerce.number().int().positive().nullable().optional(),
        image_url: z.string().trim().min(1),
        colorId: z.preprocess(
          emptyToNull,
          z.coerce.number().int().positive().nullable(),
        ),
        order: z.coerce.number().int().nonnegative().default(0),
        isMain: z.boolean().default(false),
      }),
    )
    .default([]),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        name: z.string().trim().min(1),
        description: z.string().trim().min(1),
        detailed_description: z.preprocess(
          emptyToNull,
          z.string().trim().nullable(),
        ),
        note: z.preprocess(emptyToNull, z.string().trim().nullable()),
      }),
    )
    .default([]),
});

export const adminProductQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(1),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(100).default(10),
  ),
  keyword: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  categoryId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
});
