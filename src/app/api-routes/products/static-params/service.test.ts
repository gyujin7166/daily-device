import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getStaticProductCategoryParams,
  getStaticProductDetailParams,
} from './service';

const mocks = vi.hoisted(() => ({
  productCategoryFindMany: vi.fn(),
  productFindFirst: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    productCategory: {
      findMany: mocks.productCategoryFindMany,
    },
    product: {
      findFirst: mocks.productFindFirst,
      findMany: mocks.productFindMany,
    },
  },
}));

describe('product static params service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productCategoryFindMany.mockResolvedValue([
      { slug: 'mice' },
      { slug: 'headsets' },
    ]);
    mocks.productFindFirst.mockResolvedValue({
      slug: 'first-e2e-product',
      category: { slug: 'first-e2e-category' },
    });
    mocks.productFindMany.mockResolvedValue([
      {
        slug: 'aster-mouse-mini',
        category: { slug: 'mice' },
      },
      {
        slug: 'aster-headset-mini',
        category: { slug: 'headsets' },
      },
    ]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('E2E build에서는 대표 카테고리와 상품 경로만 반환한다', async () => {
    vi.stubEnv('E2E_BUILD', 'true');

    await expect(getStaticProductCategoryParams()).resolves.toEqual([
      { category: 'first-e2e-category' },
    ]);
    await expect(getStaticProductDetailParams()).resolves.toEqual([
      {
        category: 'first-e2e-category',
        slug: 'first-e2e-product',
      },
    ]);
    expect(mocks.productCategoryFindMany).not.toHaveBeenCalled();
    expect(mocks.productFindMany).not.toHaveBeenCalled();
    expect(mocks.productFindFirst).toHaveBeenCalledTimes(2);
    expect(mocks.productFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          id: 'asc',
        },
      }),
    );
  });

  it('E2E build에 사용할 수 있는 상품이 없으면 명확하게 실패한다', async () => {
    vi.stubEnv('E2E_BUILD', 'true');
    mocks.productFindFirst.mockResolvedValue(null);

    await expect(getStaticProductDetailParams()).rejects.toThrow(
      'E2E requires a visible product with test-ready catalog data.',
    );
  });

  it('일반 build에서는 DB의 전체 정적 경로를 반환한다', async () => {
    vi.stubEnv('E2E_BUILD', 'false');

    await expect(getStaticProductCategoryParams()).resolves.toEqual([
      { category: 'mice' },
      { category: 'headsets' },
    ]);
    await expect(getStaticProductDetailParams()).resolves.toEqual([
      {
        category: 'mice',
        slug: 'aster-mouse-mini',
      },
      {
        category: 'headsets',
        slug: 'aster-headset-mini',
      },
    ]);
    expect(mocks.productFindFirst).not.toHaveBeenCalled();
    expect(mocks.productCategoryFindMany).toHaveBeenCalledOnce();
    expect(mocks.productFindMany).toHaveBeenCalledOnce();
  });
});
