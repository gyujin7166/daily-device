const GEMINI_ERROR_MESSAGES = {
  missing_api_key: 'GEMINI_API_KEY is required to call Gemini.',
  rate_limited: 'Gemini rate limit was exceeded.',
  timeout: 'Gemini request timed out.',
  provider_error: 'Gemini request failed.',
  incomplete: 'Gemini interaction did not complete.',
  empty_response: 'Gemini returned an empty text response.',
  invalid_json: 'Gemini returned invalid JSON.',
  schema_mismatch: 'Gemini response did not match the schema.',
  invalid_recommendation: 'Gemini did not select a valid product candidate.',
} as const;

const RATE_LIMIT_STATUS = 429;
const SAFE_ERROR_NAME_PATTERN = /^[A-Za-z]{1,64}$/;

export type GeminiErrorReason = keyof typeof GEMINI_ERROR_MESSAGES;

type GeminiErrorDetails = {
  status?: number;
  providerErrorName?: string;
};

/**
 * Carries only values that are safe to log. Provider messages and bodies can
 * contain prompts, answers, or credentials, so they are never copied here.
 */
export class GeminiError extends Error {
  readonly reason: GeminiErrorReason;
  readonly status?: number;
  readonly providerErrorName?: string;

  constructor(
    reason: GeminiErrorReason,
    { status, providerErrorName }: GeminiErrorDetails = {},
  ) {
    super(GEMINI_ERROR_MESSAGES[reason]);
    this.name = 'GeminiError';
    this.reason = reason;
    this.status = status;
    this.providerErrorName = providerErrorName;
  }
}

export function getSafeErrorName(error: unknown) {
  if (!(error instanceof Error)) return undefined;

  return SAFE_ERROR_NAME_PATTERN.test(error.name) ? error.name : undefined;
}

function getHttpStatus(error: unknown) {
  if (typeof error !== 'object' || error === null) return undefined;

  const { status, statusCode } = error as {
    status?: unknown;
    statusCode?: unknown;
  };
  const value = typeof status === 'number' ? status : statusCode;

  return typeof value === 'number' && Number.isInteger(value)
    ? value
    : undefined;
}

function getProviderErrorReason(
  status: number | undefined,
  providerErrorName: string | undefined,
): GeminiErrorReason {
  if (status === RATE_LIMIT_STATUS) return 'rate_limited';
  if (providerErrorName?.includes('Timeout')) return 'timeout';
  return 'provider_error';
}

export function toGeminiProviderError(error: unknown) {
  const status = getHttpStatus(error);
  const providerErrorName = getSafeErrorName(error);

  return new GeminiError(getProviderErrorReason(status, providerErrorName), {
    status,
    providerErrorName,
  });
}
