import { z } from 'zod';

const markupPattern =
  /<[^>]*>|`|\*[^*\n]+\*|_[^_\n]+_|\[[^\]]+\]\(|^\s*(?:#{1,6}|[-+*>]|\d+[.)])\s/m;

const plainText = (maxLength: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(maxLength)
    .refine(
      (text) => !markupPattern.test(text),
      'Use plain text without Markdown or HTML.',
    );

export const productRecommendationSchema = z.strictObject({
  answer: plainText(500),
  recommendations: z
    .array(
      z.strictObject({
        productId: z.int().positive(),
        reason: plainText(280),
      }),
    )
    .min(1)
    .max(3),
});

export type ProductRecommendation = z.infer<typeof productRecommendationSchema>;
