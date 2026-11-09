import { fetchApi } from '@shared/api/fetchApi';

import type { ProductSearchIntent } from '../model/productSearchIntent';
import type { ProductSearchMapping } from '../model/productSearchMapping';

export const askProductAssistant = (
  prompt: string,
): Promise<{ intent: ProductSearchIntent; mapping: ProductSearchMapping }> =>
  fetchApi('/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
