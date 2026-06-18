import { z } from 'zod';

import { PRODUCT_LINE_VALUES } from '@shared/constants/productLine';

const heroToneSchema = z.enum(['light', 'dark']);
const heroOverlayToneSchema = z.enum(['none', 'dark', 'light']);
const heroPositionSchema = z.enum(['start', 'center', 'end']);

/**
 * 관리자 폼은 선택 해제 값을 빈 문자열로 보내는 경우가 많다.
 * DB nullable 필드와 schema 타입을 맞추기 위해 route 경계에서 null로 정규화한다.
 */
const emptyToNull = (value: unknown) => {
  if (value === '' || value === null || typeof value === 'undefined') {
    return null;
  }

  return value;
};

export const adminIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

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
});

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
});

export const adminHomeSectionBodySchema = z.object({
  eyebrow: z.preprocess(emptyToNull, z.string().trim().nullable()),
  title: z.string().trim().min(1),
  subtitle: z.preprocess(emptyToNull, z.string().trim().nullable()),
  displayOrder: z.coerce.number().int().nonnegative().default(0),
  isVisible: z.boolean().default(true),
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
});

export const adminHomeSectionItemCreateBodySchema =
  adminHomeSectionItemBodySchema.extend({
    sectionId: z.coerce.number().int().positive(),
  });

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

export const adminReviewQuerySchema = z.object({
  page: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().default(1),
  ),
  limit: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().max(100).default(10),
  ),
  keyword: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z
    .preprocess(
      emptyToUndefined,
      z.enum(['all', 'visible', 'hidden']).optional(),
    )
    .default('all'),
});

export const adminReviewPatchBodySchema = z.object({
  hidden: z.boolean(),
});
