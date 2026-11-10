import { fetchApi } from '@shared/api/fetchApi';
import type { Locale } from '@shared/config/i18n/routing';

import type { ProductAssistantResult } from '../model/productSearchCandidate';

export const askProductAssistant = ({
  prompt,
  locale,
}: {
  prompt: string;
  locale: Locale;
}): Promise<ProductAssistantResult> =>
  fetchApi('/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, locale }),
  });
