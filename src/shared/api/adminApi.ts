import { HttpError } from '@shared/lib/errors/httpError';

export type AdminApiResponse<T> = {
  items: T;
  message?: string;
  code?: string;
};

export type AdminPageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function adminFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => null)) as
    | AdminApiResponse<T>
    | { code?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new HttpError(
      response.status,
      data?.message ?? 'Could not process the request.',
      data?.code,
    );
  }

  if (!data || !('items' in data)) {
    throw new Error('Invalid response format.');
  }

  return data.items;
}
