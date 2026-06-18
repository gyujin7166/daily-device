import { HttpError } from '@shared/lib/errors/httpError';

type FetchApiConfig = {
  unwrapItems?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const fetchApi = async <T = unknown>(
  endpoint: string,
  options?: RequestInit,
  config?: FetchApiConfig,
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error('네트워크 요청에 실패했습니다.');
  }

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const message =
      isRecord(data) && 'message' in data
        ? String(data.message)
        : `API 요청 실패: ${response.status}`;
    throw new HttpError(response.status, message);
  }

  const shouldUnwrapItems = config?.unwrapItems ?? true;

  if (shouldUnwrapItems && isRecord(data) && 'items' in data) {
    return data.items as T;
  }

  return data as T;
};

export const fetchApiResponse = <T = unknown>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => fetchApi<T>(endpoint, options, { unwrapItems: false });
