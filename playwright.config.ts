import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local', quiet: true });
loadEnv({ quiet: true });

const baseURL = 'http://127.0.0.1:3100';
const playwrightDatabaseUrl = process.env.PLAYWRIGHT_DATABASE_URL;
const databaseUrl = playwrightDatabaseUrl ?? process.env.DATABASE_URL;
const testUserEmail = 'playwright@daily-device.local';
const testUserName = 'Playwright User';

if (process.env.CI && !playwrightDatabaseUrl) {
  throw new Error('CI E2E requires PLAYWRIGHT_DATABASE_URL.');
}

if (!databaseUrl) {
  throw new Error('Playwright requires a database URL.');
}

process.env.DATABASE_URL = databaseUrl;
process.env.DEMO_USER_EMAIL = testUserEmail;
process.env.DEMO_USER_NAME = testUserName;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    env: {
      NEXT_DIST_DIR: '.next-playwright',
      AUTH_URL: baseURL,
      NEXTAUTH_URL: baseURL,
      DATABASE_URL: databaseUrl,
      DEMO_USER_EMAIL: testUserEmail,
      DEMO_USER_NAME: testUserName,
    },
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
