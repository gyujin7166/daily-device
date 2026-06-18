import { NextResponse } from 'next/server';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { HttpError } from '@shared/lib/errors/httpError';
import type { ApiResponse } from '@shared/types/api';

type RouteErrorResponse = ApiResponse<unknown, Record<string, unknown>>;

type HandleRouteErrorOptions = {
  fallbackMessage?: string;
  fallbackResponse?: RouteErrorResponse;
  getHttpErrorResponse?: (error: HttpError) => RouteErrorResponse;
  logMessage?: string;
};

/**
 * HttpError는 의도한 사용자 오류로 보고 status/message를 보존한다.
 * 그 외 예외는 서버 로그에만 남기고 클라이언트에는 일반 500 응답을 내려 내부 정보를 숨긴다.
 */
export function handleRouteError(
  error: unknown,
  options: HandleRouteErrorOptions = {},
) {
  if (error instanceof HttpError) {
    const response: RouteErrorResponse = options.getHttpErrorResponse
      ? options.getHttpErrorResponse(error)
      : { message: error.message };
    return NextResponse.json(response, { status: error.status });
  }

  console.error(options.logMessage ?? 'Route handler failed:', error);

  const response: RouteErrorResponse = options.fallbackResponse ?? {
    message: options.fallbackMessage ?? API_MESSAGE.INTERNAL_SERVER_ERROR,
  };

  return NextResponse.json(response, { status: 500 });
}
