export type AdminApiResponse<T> = {
  items: T;
  message?: string;
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
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(data?.message ?? '요청을 처리할 수 없습니다.');
  }

  if (!data || !('items' in data)) {
    throw new Error('응답 형식이 올바르지 않습니다.');
  }

  return data.items;
}
