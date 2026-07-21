import { describe, expect, it } from 'vitest';

import { requireE2EDatabaseUrl } from '../scripts/e2eDatabaseUrl';

describe('requireE2EDatabaseUrl', () => {
  it('accepts the dedicated E2E database URL', () => {
    const databaseUrl =
      'mysql://e2e-user:secret@example.com:4000/daily_device_e2e?sslaccept=strict';

    expect(requireE2EDatabaseUrl(databaseUrl)).toBe(databaseUrl);
  });

  it('rejects a missing URL', () => {
    expect(() => requireE2EDatabaseUrl(undefined)).toThrow(
      'PLAYWRIGHT_DATABASE_URL is required',
    );
  });

  it('rejects an invalid URL', () => {
    expect(() => requireE2EDatabaseUrl('not-a-url')).toThrow(
      'PLAYWRIGHT_DATABASE_URL must be a valid URL',
    );
  });

  it('rejects non-MySQL protocols', () => {
    expect(() =>
      requireE2EDatabaseUrl(
        'postgresql://e2e-user:secret@example.com/daily_device_e2e',
      ),
    ).toThrow('PLAYWRIGHT_DATABASE_URL must use the mysql protocol');
  });

  it('rejects any database other than the dedicated E2E database', () => {
    expect(() =>
      requireE2EDatabaseUrl(
        'mysql://app-user:secret@example.com:4000/daily_device',
      ),
    ).toThrow(
      'PLAYWRIGHT_DATABASE_URL must target the daily_device_e2e database',
    );
  });
});
