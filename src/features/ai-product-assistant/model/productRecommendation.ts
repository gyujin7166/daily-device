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
        // The server keeps an entry only when quote is one of the product's specification lines.
        specEvidence: z
          .array(
            z.strictObject({
              requirement: z.string().trim().min(1),
              quote: z.string().trim().min(1).max(200),
            }),
          )
          .max(5)
          .default([]),
      }),
    )
    .min(1)
    .max(3),
});

export type ProductRecommendation = z.infer<typeof productRecommendationSchema>;
