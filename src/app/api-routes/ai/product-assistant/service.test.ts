import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ProductSearchMapping } from '@features/ai-product-assistant/model/productSearchMapping';

import { getProductPriceInfo } from '@shared/lib/price/discount';

import { getProductSearchCandidates } from './service';

const getProductsPage = vi.hoisted(() => vi.fn());

vi.mock('server-only', () => ({}));
vi.mock('prisma/prismaClientSingleton', () => ({ default: {} }));
vi.mock('../../products/service', () => ({ getProductsPage }));

const mapping: ProductSearchMapping = {
  category: { id: 1, slug: 'mice' },
  hardRequirements: [
    { requirement: 'Bluetooth', filterId: 2, filterOptionId: 9 },
    { requirement: '2.4 GHz', filterId: 2, filterOptionId: 10 },
  ],
  preferences: [
    { requirement: 'asymmetric shape', filterId: 4, filterOptionId: 15 },
  ],
  unmatchedHardRequirements: ['solar charging'],
  unmatchedPreferences: [],
};

const noBudget = { min: null, max: null, currency: null };

function product(
  id: number,
  filter: Record<string, number[]> = { 2: [9, 10] },
  originalPrice = 120000,
  discountRate = 25,
) {
  return {
    id,
    name_en: `Mouse ${id}`,
    slug: `mouse-${id}`,
    description: `Description ${id}`,
    category: { id: 1, slug: 'mice', isVisible: true },
    filter: [filter],
    ...getProductPriceInfo(originalPrice, discountRate),
  };
}

describe('getProductSearchCandidates', () => {
  beforeEach(() => {
    getProductsPage.mockReset();
  });

  it('같은 그룹의 필수 옵션을 모두 확인하고 선호 조건으로만 순서를 정한다', async () => {
    getProductsPage.mockResolvedValue({
      items: [
        product(1, { 2: [9] }),
        product(2, { 2: [10] }),
        product(3),
        product(4, { 2: [9, 10], 4: [15] }),
      ],
    });

    await expect(
      getProductSearchCandidates(mapping, noBudget, 'en'),
    ).resolves.toEqual([
      {
        id: 4,
        name: 'Mouse 4',
        slug: 'mouse-4',
        description: 'Description 4',
        categorySlug: 'mice',
        originalPrice: 120000,
        discountedPrice: 90000,
        discountRate: 25,
        matchedPreferences: ['asymmetric shape'],
      },
      {
        id: 3,
        name: 'Mouse 3',
        slug: 'mouse-3',
        description: 'Description 3',
        categorySlug: 'mice',
        originalPrice: 120000,
        discountedPrice: 90000,
        discountRate: 25,
        matchedPreferences: [],
      },
    ]);
    expect(getProductsPage).toHaveBeenCalledExactlyOnceWith(
      'mice',
      undefined,
      undefined,
      'relevance',
      ['9', '10'],
      {},
      {},
      {},
      'en',
    );
  });

  it('KRW 예산의 경계를 할인 판매가로 확인한다', async () => {
    getProductsPage.mockResolvedValue({
      items: [
        product(1),
        product(2, undefined, 120000, 10),
        product(3, undefined, 80000, 0),
        product(4, undefined, 100000, 0),
      ],
    });

    const candidates = await getProductSearchCandidates(
      mapping,
      { min: 90000, max: 100000, currency: 'KRW' },
      'ko',
    );

    expect(candidates.map(({ id }) => id)).toEqual([1, 4]);
    expect(getProductsPage.mock.calls[0][5]).toEqual({});
  });

  it.each(['USD', 'JPY', null])(
    'KRW가 아닌 통화 %s는 가격으로 후보를 제거하지 않는다',
    async (currency) => {
      getProductsPage.mockResolvedValue({ items: [product(1)] });

      await expect(
        getProductSearchCandidates(
          mapping,
          { min: null, max: 1, currency },
          'ko',
        ),
      ).resolves.toMatchObject([{ id: 1 }]);
    },
  );

  it('판매가와 필수 조건 검증 및 선호 정렬을 마친 뒤 12개를 반환한다', async () => {
    const aboveBudget = Array.from({ length: 12 }, (_, index) =>
      product(index + 1, undefined, 120000, 0),
    );
    const withinBudget = Array.from({ length: 13 }, (_, index) =>
      product(index + 20),
    ).reverse();
    getProductsPage.mockResolvedValue({
      items: [
        ...aboveBudget,
        product(13, { 2: [9] }),
        ...withinBudget,
        product(99, { 2: [9, 10], 4: [15] }),
      ],
    });

    const candidates = await getProductSearchCandidates(
      mapping,
      { min: null, max: 100000, currency: 'KRW' },
      'ko',
    );

    expect(candidates.map(({ id }) => id)).toEqual([
      99, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    ]);
  });
});
