import { BadRequestError } from '@shared/lib/errors/httpError';

import type { z } from 'zod';

/**
 * route handler의 zod 오류 상세 대신 호출부가 정한 사용자 메시지만 클라이언트에 전달한다.
 */
export function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  errorMessage = 'Invalid request',
): z.infer<TSchema> {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new BadRequestError(errorMessage);
  }

  return parsed.data;
}
