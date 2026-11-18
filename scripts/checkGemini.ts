import { config } from 'dotenv';

import { GeminiError } from '../src/shared/lib/gemini/geminiError';
import { generateGeminiText } from '../src/shared/lib/gemini/generateGeminiText';

// npm run ai:check uses the react-server condition to load the server-only helper.
config({ path: '.env.local', quiet: true });
config({ quiet: true });

function getErrorMessage(error: unknown) {
  if (error instanceof GeminiError) {
    const status = error.status ?? 'none';
    const providerError = error.providerErrorName ?? 'unknown';

    return `${error.message} (reason: ${error.reason}, status: ${status}, provider error: ${providerError})`;
  }

  return error instanceof Error ? error.message : 'Unknown error';
}

generateGeminiText(
  'Reply with a short message confirming that the Gemini API connection works.',
)
  .then((text) => {
    console.log(`Gemini connection check succeeded:\n${text}`);
  })
  .catch((error: unknown) => {
    const message = getErrorMessage(error);
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const safeMessage = apiKey
      ? message.replaceAll(apiKey, '[REDACTED]')
      : message;

    console.error(`Gemini connection check failed: ${safeMessage}`);
    process.exitCode = 1;
  });
