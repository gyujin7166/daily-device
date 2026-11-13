import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

import type { Interactions } from '@google/genai';

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

type GenerateGeminiTextOptions = {
  thinkingLevel?: Interactions.ThinkingLevel;
};

function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required to call Gemini.');
  }

  return new GoogleGenAI({ apiKey });
}

async function requestGeminiText(
  prompt: string,
  { thinkingLevel }: GenerateGeminiTextOptions = {},
  responseFormat?: Interactions.TextResponseFormat,
): Promise<string> {
  const client = createGeminiClient();
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  const interaction = await client.interactions.create({
    model,
    input: prompt,
    // Disables interaction storage; Google's Free Tier data-use terms still apply.
    store: false,
    ...(thinkingLevel
      ? { generation_config: { thinking_level: thinkingLevel } }
      : {}),
    ...(responseFormat ? { response_format: responseFormat } : {}),
  });

  if (interaction.status !== 'completed') {
    throw new Error('Gemini interaction did not complete.');
  }

  const text = interaction.output_text?.trim();

  if (!text) {
    throw new Error('Gemini returned an empty text response.');
  }

  return text;
}

export function generateGeminiText(
  prompt: string,
  options?: GenerateGeminiTextOptions,
): Promise<string> {
  return requestGeminiText(prompt, options);
}

export async function generateGeminiStructuredOutput<TSchema extends z.ZodType>(
  prompt: string,
  schema: TSchema,
  options?: GenerateGeminiTextOptions,
): Promise<z.output<TSchema>> {
  const text = await requestGeminiText(prompt, options, {
    type: 'text',
    mime_type: 'application/json',
    schema: z.toJSONSchema(schema),
  });

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('Gemini returned invalid JSON.');
  }

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Gemini response did not match the schema.');
  }

  return parsed.data;
}
