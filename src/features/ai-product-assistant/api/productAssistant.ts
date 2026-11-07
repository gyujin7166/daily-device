import { fetchApi } from '@shared/api/fetchApi';

import type { ProductSearchIntent } from '../model/productSearchIntent';

export const askProductAssistant = (
  prompt: string,
): Promise<{ intent: ProductSearchIntent }> =>
  fetchApi('/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
