import { API_ERROR_CODE } from '@shared/constants/apiErrorCode';
import { ApiError, HttpError } from '@shared/lib/errors/httpError';

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
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError(
      API_ERROR_CODE.NETWORK_REQUEST_FAILED,
      'Network request failed.',
    );
  }
  const data = (await response.json().catch(() => null)) as
    | AdminApiResponse<T>
    | { code?: string; message?: string }
    | null;

  if (!response.ok) {
    const hasMessage = !!data?.message;
    throw new HttpError(
      response.status,
      data?.message ?? 'Request failed.',
      data?.code ?? (hasMessage ? undefined : API_ERROR_CODE.REQUEST_FAILED),
    );
  }

  if (!data || !('items' in data)) {
    throw new ApiError(
      API_ERROR_CODE.INVALID_RESPONSE,
      'Invalid response format.',
    );
  }

  return data.items;
}
