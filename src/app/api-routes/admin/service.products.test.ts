import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAdminProducts } from './service';

const mocks = vi.hoisted(() => ({
  categoryFindMany: vi.fn(),
  colorFindMany: vi.fn(),
  productCount: vi.fn(),
  productFindMany: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('auth', () => ({
  auth: vi.fn(),
}));

vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    productCategory: {
      findMany: mocks.categoryFindMany,
    },
    color: {
      findMany: mocks.colorFindMany,
    },
    product: {
      count: mocks.productCount,
      findMany: mocks.productFindMany,
    },
  },
}));

describe('getAdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.categoryFindMany.mockResolvedValue([]);
    mocks.colorFindMany.mockResolvedValue([]);
    mocks.productCount.mockResolvedValue(0);
    mocks.productFindMany.mockResolvedValue([]);
  });

  it('상품 폼에 사용할 색상 번역을 함께 조회한다', async () => {
    await getAdminProducts({
      page: 1,
      limit: 10,
      keyword: '',
      categoryId: undefined,
    });

    expect(mocks.colorFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          translations: {
            select: {
              locale: true,
              name: true,
            },
            orderBy: { locale: 'asc' },
          },
        }),
      }),
    );
  });
});
