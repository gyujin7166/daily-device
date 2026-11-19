import { NextResponse } from 'next/server';

import { z } from 'zod';

import { MAX_PRODUCT_ASSISTANT_PROMPT_LENGTH } from '@features/ai-product-assistant/model/constants';
import type { ProductAssistantResult } from '@features/ai-product-assistant/model/productAssistantResult';

import { routing } from '@shared/config/i18n/routing';
import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { HttpError } from '@shared/lib/errors/httpError';
import { GeminiError, getSafeErrorName } from '@shared/lib/gemini/geminiError';
import type { ApiResponse } from '@shared/types/api';

import { getProductAssistantResult } from './service';

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(MAX_PRODUCT_ASSISTANT_PROMPT_LENGTH),
  locale: z.enum(routing.locales).default(routing.defaultLocale),
});

const LOG_MESSAGE = '[POST /api/ai/product-assistant] failed:';
const RATE_LIMITED_RESPONSE: ApiResponse<never, { code: string }> = {
  message: 'Too Many Requests',
  code: 'AI_RATE_LIMITED',
};

function getSafeErrorLogDetails(error: unknown) {
  if (error instanceof GeminiError) {
    const { reason, status, providerErrorName } = error;

    return {
      reason,
      ...(status === undefined ? {} : { status }),
      ...(providerErrorName === undefined ? {} : { providerErrorName }),
    };
  }

  const errorName = getSafeErrorName(error);

  return {
    reason: 'unexpected',
    ...(errorName === undefined ? {} : { errorName }),
  };
}

export async function POST(request: Request) {
  try {
    await getRequiredUserId();
    const body = await readJsonBody(request);
    const { prompt, locale } = parseWithSchema(requestSchema, body);
    const response: ApiResponse<ProductAssistantResult> = {
      items: await getProductAssistantResult(prompt, locale),
      message: API_MESSAGE.SUCCESS,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return handleRouteError(error);
    }

    // Provider errors may contain input, output, or credentials. Log only a safe error.
    const safeError = new Error('AI product assistant request failed.', {
      cause: getSafeErrorLogDetails(error),
    });

    if (error instanceof GeminiError && error.reason === 'rate_limited') {
      console.error(LOG_MESSAGE, safeError);

      return NextResponse.json(RATE_LIMITED_RESPONSE, {
        status: 429,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    return handleRouteError(safeError, { logMessage: LOG_MESSAGE });
  }
}
