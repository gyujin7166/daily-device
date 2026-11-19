import type { ProductRecommendation } from './productRecommendation';
import type { ProductSearchCandidate } from './productSearchCandidate';
import type { ProductSearchIntent } from './productSearchIntent';
import type { ProductSearchMapping } from './productSearchMapping';

export type ProductAssistantResult = {
  intent: ProductSearchIntent;
  mapping: ProductSearchMapping;
  candidates: ProductSearchCandidate[];
  recommendation: ProductRecommendation | null;
};
