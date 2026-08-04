import { z } from 'zod';

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
