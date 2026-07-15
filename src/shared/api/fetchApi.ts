import { API_ERROR_CODE } from '@shared/constants/apiErrorCode';
import { ApiError, HttpError } from '@shared/lib/errors/httpError';

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
    throw new ApiError(
      API_ERROR_CODE.NETWORK_REQUEST_FAILED,
      'Network request failed.',
    );
  }

  let data: unknown = undefined;
  try {
    data = await response.json();
  } catch {
    data = undefined;
  }

  if (!response.ok) {
    const responseMessage =
      isRecord(data) && 'message' in data ? String(data.message) : undefined;
    const message = responseMessage
      ? responseMessage
      : `Request failed with status ${response.status}.`;
    const code =
      isRecord(data) && typeof data.code === 'string'
        ? data.code
        : responseMessage
          ? undefined
          : API_ERROR_CODE.REQUEST_FAILED;

    throw new HttpError(response.status, message, code);
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
