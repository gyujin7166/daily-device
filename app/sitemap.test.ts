import { beforeEach, describe, expect, it, vi } from 'vitest';

import sitemap from './sitemap';

const mocks = vi.hoisted(() => ({
  getCategories: vi.fn(),
  getProducts: vi.fn(),
}));

vi.mock('@app/api-routes/products/static-params/service', () => ({
  getStaticProductCategoryParams: mocks.getCategories,
  getStaticProductDetailParams: mocks.getProducts,
}));

describe('sitemap metadata route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCategories.mockResolvedValue([{ category: 'mice' }]);
    mocks.getProducts.mockResolvedValue([
      { category: 'mice', slug: 'breeze-mouse-desk' },
      { category: 'hidden-category', slug: 'test-product' },
    ]);
  });

  it('한국어 공개 URL에는 기본 locale prefix를 붙이지 않는다', async () => {
    const entries = await sitemap();
    const urls = entries.map(({ url }) => url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://daily-device.vercel.app/',
        'https://daily-device.vercel.app/products',
        'https://daily-device.vercel.app/products/discounts',
        'https://daily-device.vercel.app/terms',
        'https://daily-device.vercel.app/privacy',
        'https://daily-device.vercel.app/cookies',
      ]),
    );
    expect(urls.some((url) => new URL(url).pathname.startsWith('/ko'))).toBe(
      false,
    );
  });

  it('영어 공개 URL에는 /en prefix를 붙인다', async () => {
    const urls = (await sitemap()).map(({ url }) => url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://daily-device.vercel.app/en',
        'https://daily-device.vercel.app/en/products',
        'https://daily-device.vercel.app/en/products/discounts',
        'https://daily-device.vercel.app/en/terms',
        'https://daily-device.vercel.app/en/privacy',
        'https://daily-device.vercel.app/en/cookies',
      ]),
    );
  });

  it('기존 조회 결과의 공개 category와 상품 URL을 두 언어로 포함한다', async () => {
    const urls = (await sitemap()).map(({ url }) => url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://daily-device.vercel.app/products/mice',
        'https://daily-device.vercel.app/en/products/mice',
        'https://daily-device.vercel.app/products/mice/breeze-mouse-desk',
        'https://daily-device.vercel.app/en/products/mice/breeze-mouse-desk',
      ]),
    );
    expect(mocks.getCategories).toHaveBeenCalledOnce();
    expect(mocks.getProducts).toHaveBeenCalledOnce();
  });

  it('공개 category 목록에 없는 상품과 category URL은 제외한다', async () => {
    const urls = (await sitemap()).map(({ url }) => url);

    expect(urls.some((url) => url.includes('hidden-category'))).toBe(false);
    expect(urls).toHaveLength(16);
  });

  it('공개 URL만 production origin으로 생성하고 query와 fragment는 넣지 않는다', async () => {
    const entries = await sitemap();
    const allowedPaths = new Set([
      '/',
      '/en',
      '/products',
      '/en/products',
      '/products/discounts',
      '/en/products/discounts',
      '/terms',
      '/en/terms',
      '/privacy',
      '/en/privacy',
      '/cookies',
      '/en/cookies',
      '/products/mice',
      '/en/products/mice',
      '/products/mice/breeze-mouse-desk',
      '/en/products/mice/breeze-mouse-desk',
    ]);

    for (const { url } of entries) {
      const parsed = new URL(url);

      expect(parsed.origin).toBe('https://daily-device.vercel.app');
      expect(allowedPaths.has(parsed.pathname)).toBe(true);
      expect(parsed.search).toBe('');
      expect(parsed.hash).toBe('');
    }
  });

  it('조회 결과가 중복되거나 정적 경로와 겹쳐도 absolute URL을 중복하지 않는다', async () => {
    mocks.getCategories.mockResolvedValue([
      { category: 'mice' },
      { category: 'mice' },
      { category: 'discounts' },
    ]);
    mocks.getProducts.mockResolvedValue([
      { category: 'mice', slug: 'breeze-mouse-desk' },
      { category: 'mice', slug: 'breeze-mouse-desk' },
    ]);

    const urls = (await sitemap()).map(({ url }) => url);

    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toHaveLength(16);
  });

  it('공개 category가 없으면 상품을 제외하고 정적 공개 URL만 반환한다', async () => {
    mocks.getCategories.mockResolvedValue([]);

    const entries = await sitemap();

    expect(entries).toHaveLength(12);
    expect(entries.some(({ url }) => url.includes('breeze-mouse-desk'))).toBe(
      false,
    );
  });

  it('근거 없는 수정일·우선순위·갱신 주기와 언어 alternates를 추가하지 않는다', async () => {
    const entries = await sitemap();

    for (const entry of entries) {
      expect(Object.keys(entry)).toEqual(['url']);
    }
  });
});
