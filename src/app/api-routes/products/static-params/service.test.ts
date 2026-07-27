import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getStaticProductCategoryParams,
  getStaticProductDetailParams,
} from './service';

const mocks = vi.hoisted(() => ({
  productCategoryFindMany: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    productCategory: {
      findMany: mocks.productCategoryFindMany,
    },
    product: {
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
      { category: 'mice' },
    ]);
    await expect(getStaticProductDetailParams()).resolves.toEqual([
      {
        category: 'mice',
        slug: 'aster-mouse-mini',
      },
    ]);
    expect(mocks.productCategoryFindMany).not.toHaveBeenCalled();
    expect(mocks.productFindMany).not.toHaveBeenCalled();
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
    expect(mocks.productCategoryFindMany).toHaveBeenCalledOnce();
    expect(mocks.productFindMany).toHaveBeenCalledOnce();
  });
});
