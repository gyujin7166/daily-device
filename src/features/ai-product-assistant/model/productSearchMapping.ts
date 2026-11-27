import { z } from 'zod';

import { productSearchIntentSchema } from './productSearchIntent';

const mappedConditionSchema = z.strictObject({
  requirement: z.string().min(1),
  filterId: z.int().positive(),
  filterOptionId: z.int().positive(),
});

// exact: the catalog color is the requested color. similar: it is in the same color family.
const colorMatchSchema = z.enum(['exact', 'similar']);

const mappedColorSchema = z.strictObject({
  requirement: z.string().min(1),
  colorId: z.int().positive(),
  match: colorMatchSchema,
  name_ko: z.string().min(1),
  name_en: z.string().min(1),
});

export const productSearchMappingSchema = z.strictObject({
  category: z
    .strictObject({ id: z.int().positive(), slug: z.string().min(1) })
    .nullable(),
  hardRequirements: z.array(mappedConditionSchema),
  preferences: z.array(mappedConditionSchema),
  colors: z.array(mappedColorSchema),
  // Required colors with no exact or similar catalog color.
  unavailableColors: z.array(z.string().min(1)),
  unmatchedHardRequirements: z.array(z.string().min(1)),
  unmatchedPreferences: z.array(z.string().min(1)),
});

export type ProductSearchMapping = z.infer<typeof productSearchMappingSchema>;

// Strip stray fields such as filterId. The server derives it from the option's parent.
const optionSelectionSchema = z.object({
  requirement: z.string().min(1),
  filterOptionId: z.int(),
});

const colorSelectionSchema = z.object({
  requirement: z.string().min(1),
  colorId: z.int(),
  match: colorMatchSchema,
});

export const productSearchAnalysisSchema = z.strictObject({
  intent: productSearchIntentSchema,
  mappingDraft: z.strictObject({
    categoryId: z.int().nullable(),
    hardRequirements: z.array(optionSelectionSchema),
    preferences: z.array(optionSelectionSchema),
    colors: z.array(colorSelectionSchema),
    unavailableColors: z.array(z.string().min(1)),
  }),
});

export type ProductSearchMappingDraft = z.infer<
  typeof productSearchAnalysisSchema
>['mappingDraft'];
