import { API_ERROR_CODE } from '@shared/constants/apiErrorCode';
import { ApiError, HttpError } from '@shared/lib/errors/httpError';

export type ApiErrorMessageKey =
  | 'networkRequestFailed'
  | 'requestFailed'
  | 'invalidResponse';

type ApiErrorTranslator = (key: ApiErrorMessageKey) => string;

const apiErrorMessageKeyByCode = {
  [API_ERROR_CODE.NETWORK_REQUEST_FAILED]: 'networkRequestFailed',
  [API_ERROR_CODE.REQUEST_FAILED]: 'requestFailed',
  [API_ERROR_CODE.INVALID_RESPONSE]: 'invalidResponse',
} as const satisfies Record<
  (typeof API_ERROR_CODE)[keyof typeof API_ERROR_CODE],
  ApiErrorMessageKey
>;

export const getApiErrorMessage = (
  error: unknown,
  t: ApiErrorTranslator,
  fallbackMessage: string,
) => {
  if (error instanceof HttpError || error instanceof ApiError) {
    const messageKey = error.code
      ? apiErrorMessageKeyByCode[
          error.code as keyof typeof apiErrorMessageKeyByCode
        ]
      : undefined;

    if (messageKey) {
      return t(messageKey);
    }
  }

  return error instanceof Error ? error.message : fallbackMessage;
};
