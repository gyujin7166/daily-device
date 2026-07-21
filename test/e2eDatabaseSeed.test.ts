import { describe, expect, it } from 'vitest';

import {
  isE2ESeedDataReady,
  readE2ESeedDataCounts,
  retryE2EDatabaseOperation,
} from '../scripts/e2eDatabaseSeed';

import type { E2ESeedDataCountReaders } from '../scripts/e2eDatabaseSeed';

const readyCounts = {
  categories: 23,
  categoryTranslations: 46,
  colors: 9,
  colorTranslations: 18,
  filterOptions: 168,
  filterOptionTranslations: 336,
  filters: 55,
  filterTranslations: 110,
  heroes: 21,
  heroTranslations: 42,
  homeSectionItems: 6,
  homeSectionItemTranslations: 12,
  homeSections: 2,
  homeSectionTranslations: 4,
  productDetails: 735,
  productDetailTranslations: 1470,
  productImages: 1053,
  products: 147,
  productTranslations: 294,
};

describe('isE2ESeedDataReady', () => {
  it('accepts complete catalog and translation seed data', () => {
    expect(isE2ESeedDataReady(readyCounts)).toBe(true);
  });

  it('rejects an empty catalog', () => {
    expect(
      isE2ESeedDataReady({
        ...readyCounts,
        products: 0,
        productTranslations: 0,
      }),
    ).toBe(false);
  });

  it('rejects incomplete translations', () => {
    expect(
      isE2ESeedDataReady({
        ...readyCounts,
        productTranslations: readyCounts.products * 2 - 1,
      }),
    ).toBe(false);
  });

  it('rejects missing product images', () => {
    expect(
      isE2ESeedDataReady({
        ...readyCounts,
        productImages: 0,
      }),
    ).toBe(false);
  });
});

describe('readE2ESeedDataCounts', () => {
  it('reads counts sequentially to avoid concurrent database connections', async () => {
    let activeReaders = 0;
    let maxActiveReaders = 0;
    const readers = Object.fromEntries(
      Object.entries(readyCounts).map(([key, value]) => [
        key,
        async () => {
          activeReaders += 1;
          maxActiveReaders = Math.max(maxActiveReaders, activeReaders);
          await new Promise((resolve) => setTimeout(resolve, 1));
          activeReaders -= 1;
          return value;
        },
      ]),
    ) as E2ESeedDataCountReaders;

    await expect(readE2ESeedDataCounts(readers)).resolves.toEqual(readyCounts);
    expect(maxActiveReaders).toBe(1);
  });
});

describe('retryE2EDatabaseOperation', () => {
  it('retries transient failures with increasing delays', async () => {
    let attempts = 0;
    const delays: number[] = [];

    const result = await retryE2EDatabaseOperation(
      async () => {
        attempts += 1;

        if (attempts < 3) {
          throw new Error('temporary connection failure');
        }

        return 'ready';
      },
      {
        maxAttempts: 3,
        retryDelayMs: 100,
        wait: async (delayMs) => {
          delays.push(delayMs);
        },
      },
    );

    expect(result).toBe('ready');
    expect(attempts).toBe(3);
    expect(delays).toEqual([100, 200]);
  });

  it('throws the last error after the retry limit', async () => {
    const wait = async () => undefined;

    await expect(
      retryE2EDatabaseOperation(
        async () => {
          throw new Error('database unavailable');
        },
        { maxAttempts: 2, retryDelayMs: 100, wait },
      ),
    ).rejects.toThrow('database unavailable');
  });
});
