import { NextResponse } from 'next/server';

import { z } from 'zod';

import { MAX_PRODUCT_ASSISTANT_PROMPT_LENGTH } from '@features/ai-product-assistant/model/constants';
import type { ProductAssistantResult } from '@features/ai-product-assistant/model/productSearchCandidate';

import { routing } from '@shared/config/i18n/routing';
import { API_MESSAGE } from '@shared/constants/apiMessage';
import { getRequiredUserId } from '@shared/lib/api/getRequiredUserId';
import { handleRouteError } from '@shared/lib/api/handleRouteError';
import { parseWithSchema } from '@shared/lib/api/parseWithSchema';
import { readJsonBody } from '@shared/lib/api/readJsonBody';
import { HttpError } from '@shared/lib/errors/httpError';
import type { ApiResponse } from '@shared/types/api';

import { getProductAssistantResult } from './service';

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(MAX_PRODUCT_ASSISTANT_PROMPT_LENGTH),
  locale: z.enum(routing.locales).default(routing.defaultLocale),
});

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
    // Provider errors may contain input, output, or credentials. Log only a safe error.
    const safeError =
      error instanceof HttpError
        ? error
        : new Error('AI product assistant request failed.');

    return handleRouteError(safeError, {
      logMessage: '[POST /api/ai/product-assistant] failed:',
    });
  }
}
