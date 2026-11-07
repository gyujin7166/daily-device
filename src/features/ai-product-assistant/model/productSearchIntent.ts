import { z } from 'zod';

export const productSearchIntentSchema = z.strictObject({
  categoryHint: z.string().min(1).nullable(),
  hardRequirements: z.array(z.string().min(1)),
  preferences: z.array(z.string().min(1)),
  priority: z.array(z.string().min(1)),
  priceRange: z.strictObject({
    min: z.number().nonnegative().nullable(),
    max: z.number().nonnegative().nullable(),
    currency: z.string().min(1).nullable(),
  }),
  summary: z.string().min(1),
});

export type ProductSearchIntent = z.infer<typeof productSearchIntentSchema>;
