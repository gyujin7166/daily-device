import { createTranslator } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';

import { generateMetadata as paymentMetadata } from './(checkout)/payments/toss/success/page';
import { generateMetadata as orderMetadata } from './(my)/my/orders/[orderNumber]/page';
import { generateMetadata as reviewMetadata } from './(my)/my/reviews/write/[orderNumber]/page';
import { generateMetadata as productMetadata } from './(shop)/products/[category]/[slug]/page';
import { generateMetadata as categoryMetadata } from './(shop)/products/[category]/page';
import { generateMetadata as searchMetadata } from './(shop)/search/page';

import type { Locale } from 'next-intl';

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(),
  getProduct: vi.fn(),
}));

vi.mock('@pages/products/category', () => ({
  default: () => null,
  generateStaticParams: vi.fn(),
}));
vi.mock('@pages/products/detail', () => ({
  default: () => null,
  generateStaticParams: vi.fn(),
}));
vi.mock('@pages/search', () => ({ default: () => null }));
vi.mock('@pages/my/order-detail', () => ({ default: () => null }));
vi.mock('@pages/my/reviews-write-order', () => ({ default: () => null }));
vi.mock('@pages/payments/toss/success', () => ({ default: () => null }));
vi.mock('@app/api-routes/products/filters/service', () => ({
  getProductCategoryBySlug: mocks.getCategory,
}));
vi.mock('@app/api-routes/products/[slug]/service', () => ({
  getProductDetailBySlug: mocks.getProduct,
}));
vi.mock('next-intl/server', () => ({
  getTranslations: async ({
    locale,
    namespace,
  }: {
    locale: Locale;
    namespace: 'Metadata';
  }) =>
    createTranslator({
      locale,
      messages: locale === 'en' ? enMessages : koMessages,
      namespace,
    }),
}));
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

describe('상품 route metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    { locale: 'ko', name: '마우스' },
    { locale: 'en', name: 'Mice' },
  ] as const)(
    '카테고리 slug 대신 $locale DB 번역명을 사용한다',
    async ({ locale, name }) => {
      mocks.getCategory.mockResolvedValue({ id: 1, name });

      const metadata = await categoryMetadata({
        params: Promise.resolve({ locale, category: ' mice ' }),
      });

      expect(metadata.title).toBe(name);
      expect(metadata.description).toContain(name);
      expect(mocks.getCategory).toHaveBeenCalledWith('mice', locale);
      expect(metadata.robots).toBeUndefined();
    },
  );

  it('존재하지 않는 카테고리에는 metadata를 생성하지 않는다', async () => {
    mocks.getCategory.mockResolvedValue(null);

    await expect(
      categoryMetadata({
        params: Promise.resolve({ locale: 'ko', category: 'missing' }),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each([
    { locale: 'ko', name: '테스트 마우스', description: '한국어 상품 설명' },
    {
      locale: 'en',
      name: 'Test Mouse',
      description: 'English product description',
    },
  ])(
    '상품의 $locale 이름과 설명을 재사용한다',
    async ({ locale, name, description }) => {
      mocks.getProduct.mockResolvedValue({
        product: { name_en: name, description, category: { slug: 'mice' } },
      });

      const metadata = await productMetadata({
        params: Promise.resolve({
          locale,
          category: ' mice ',
          slug: 'test%20mouse',
        }),
      });

      expect(metadata).toEqual({ title: name, description });
      expect(mocks.getProduct).toHaveBeenCalledWith('test mouse', locale);
    },
  );

  it.each([
    null,
    { name_en: 'Wrong category product', category: { slug: 'keyboards' } },
  ])(
    '없는 상품이나 다른 카테고리 상품의 metadata를 노출하지 않는다',
    async (product) => {
      mocks.getProduct.mockResolvedValue({ product });

      await expect(
        productMetadata({
          params: Promise.resolve({
            locale: 'en',
            category: 'mice',
            slug: 'missing',
          }),
        }),
      ).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );
});

describe('사용자별 값이 없는 화면 metadata', () => {
  it.each([
    { locale: 'ko', messages: koMessages.Metadata },
    { locale: 'en', messages: enMessages.Metadata },
  ] as const)(
    '$locale 제목에 검색어·주문번호·결제 식별자를 포함하지 않는다',
    async ({ locale, messages }) => {
      const props = {
        params: Promise.resolve({ locale, orderNumber: 'private-order-123' }),
        searchParams: Promise.resolve({
          query: 'private@example.test',
          orderId: 'private-payment-123',
        }),
      };

      expect(await searchMetadata(props)).toEqual({
        title: messages.search,
        robots: { index: false, follow: false },
      });
      expect(await orderMetadata(props)).toEqual({
        title: messages.orderDetail,
      });
      expect(await reviewMetadata(props)).toEqual({
        title: messages.reviewWrite,
      });
      expect(await paymentMetadata(props)).toEqual({
        title: messages.paymentSuccess,
      });
    },
  );
});
