import { z } from 'zod';

export const adminIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
