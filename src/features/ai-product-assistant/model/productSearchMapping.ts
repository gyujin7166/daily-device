import { z } from 'zod';

import { productSearchIntentSchema } from './productSearchIntent';

const mappedConditionSchema = z.strictObject({
  requirement: z.string().min(1),
  filterId: z.int().positive(),
  filterOptionId: z.int().positive(),
});

export const productSearchMappingSchema = z.strictObject({
  category: z
    .strictObject({ id: z.int().positive(), slug: z.string().min(1) })
    .nullable(),
  hardRequirements: z.array(mappedConditionSchema),
  preferences: z.array(mappedConditionSchema),
  unmatchedHardRequirements: z.array(z.string().min(1)),
  unmatchedPreferences: z.array(z.string().min(1)),
});

export type ProductSearchMapping = z.infer<typeof productSearchMappingSchema>;

// Strip stray fields such as filterId. The server derives it from the option's parent.
const optionSelectionSchema = z.object({
  requirement: z.string().min(1),
  filterOptionId: z.int(),
});

export const productSearchAnalysisSchema = z.strictObject({
  intent: productSearchIntentSchema,
  mappingDraft: z.strictObject({
    categoryId: z.int().nullable(),
    hardRequirements: z.array(optionSelectionSchema),
    preferences: z.array(optionSelectionSchema),
  }),
});

export type ProductSearchMappingDraft = z.infer<
  typeof productSearchAnalysisSchema
>['mappingDraft'];
