import { HttpError } from '@shared/lib/errors/httpError';

/**
 * 인증 실패는 재시도해도 성공 가능성이 낮고 로그인 UX를 지연시키므로 즉시 중단한다.
 * 그 외 네트워크/일시 오류만 짧게 재시도한다.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (error instanceof HttpError && error.status === 401) {
    return false;
  }

  return failureCount < 2;
};
