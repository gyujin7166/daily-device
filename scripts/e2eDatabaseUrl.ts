const E2E_DATABASE_NAME = 'daily_device_e2e';
const E2E_DATABASE_CONNECTION_OPTIONS = {
  connection_limit: '3',
  connect_timeout: '30',
  pool_timeout: '60',
} as const;

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

export function configureE2EDatabaseUrl(value: string | undefined) {
  const parsedUrl = new URL(requireE2EDatabaseUrl(value));

  for (const [name, optionValue] of Object.entries(
    E2E_DATABASE_CONNECTION_OPTIONS,
  )) {
    parsedUrl.searchParams.set(name, optionValue);
  }

  return parsedUrl.toString();
}
