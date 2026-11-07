import { fetchApi } from '@shared/api/fetchApi';

export const askProductAssistant = (
  prompt: string,
): Promise<{ answer: string }> =>
  fetchApi('/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
