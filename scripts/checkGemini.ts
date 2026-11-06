import { config } from 'dotenv';

import { generateGeminiText } from '../src/shared/lib/gemini/generateGeminiText';

// npm run ai:check uses the react-server condition to load the server-only helper.
config({ path: '.env.local', quiet: true });
config({ quiet: true });

generateGeminiText(
  'Reply with a short message confirming that the Gemini API connection works.',
)
  .then((text) => {
    console.log(`Gemini connection check succeeded:\n${text}`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const safeMessage = apiKey
      ? message.replaceAll(apiKey, '[REDACTED]')
      : message;

    console.error(`Gemini connection check failed: ${safeMessage}`);
    process.exitCode = 1;
  });
