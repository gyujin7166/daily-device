import { describe, expect, it } from 'vitest';

import { isE2ESeedDataReady } from '../scripts/e2eDatabaseSeed';

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
