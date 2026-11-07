import 'server-only';

import { GoogleGenAI } from '@google/genai';

import type { Interactions } from '@google/genai';

const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

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

export async function generateGeminiText(
  prompt: string,
  { thinkingLevel }: GenerateGeminiTextOptions = {},
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
