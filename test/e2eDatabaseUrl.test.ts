import { describe, expect, it } from 'vitest';

import {
  configureE2EDatabaseUrl,
  requireE2EDatabaseUrl,
} from '../scripts/e2eDatabaseUrl';

describe('E2E database URL', () => {
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

  it('adds stable direct connection options without dropping existing parameters', () => {
    const configuredUrl = new URL(
      configureE2EDatabaseUrl(
        'mysql://e2e-user:secret@example.com:4000/daily_device_e2e?sslaccept=strict',
      ),
    );

    expect(configuredUrl.searchParams.get('sslaccept')).toBe('strict');
    expect(configuredUrl.searchParams.get('connection_limit')).toBe('3');
    expect(configuredUrl.searchParams.get('connect_timeout')).toBe('30');
    expect(configuredUrl.searchParams.get('pool_timeout')).toBe('60');
  });

  it('replaces existing direct connection options instead of duplicating them', () => {
    const configuredUrl = new URL(
      configureE2EDatabaseUrl(
        'mysql://e2e-user:secret@example.com:4000/daily_device_e2e?connection_limit=10&connect_timeout=5&pool_timeout=10',
      ),
    );

    expect(configuredUrl.searchParams.getAll('connection_limit')).toEqual([
      '3',
    ]);
    expect(configuredUrl.searchParams.getAll('connect_timeout')).toEqual([
      '30',
    ]);
    expect(configuredUrl.searchParams.getAll('pool_timeout')).toEqual(['60']);
  });
});
