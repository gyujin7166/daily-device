const E2E_DATABASE_NAME = 'daily_device_e2e';

export function requireE2EDatabaseUrl(value: string | undefined) {
  const databaseUrl = value?.trim();

  if (!databaseUrl) {
    throw new Error('PLAYWRIGHT_DATABASE_URL is required.');
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('PLAYWRIGHT_DATABASE_URL must be a valid URL.');
  }

  if (parsedUrl.protocol !== 'mysql:') {
    throw new Error('PLAYWRIGHT_DATABASE_URL must use the mysql protocol.');
  }

  const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1));

  if (databaseName !== E2E_DATABASE_NAME) {
    throw new Error(
      `PLAYWRIGHT_DATABASE_URL must target the ${E2E_DATABASE_NAME} database.`,
    );
  }

  return databaseUrl;
}
