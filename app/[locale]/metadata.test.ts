import { createTranslator } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';

import { generateMetadata as loginMetadata } from './(auth)/login/page';
import { generateMetadata as paymentMetadata } from './(checkout)/payments/toss/success/page';
import { generateMetadata as orderMetadata } from './(my)/my/orders/[orderNumber]/page';
import { generateMetadata as reviewMetadata } from './(my)/my/reviews/write/[orderNumber]/page';
import { generateMetadata as cookiesMetadata } from './(shop)/cookies/page';
import { generateMetadata as homeMetadata } from './(shop)/page';
import { generateMetadata as privacyMetadata } from './(shop)/privacy/page';
import { generateMetadata as productMetadata } from './(shop)/products/[category]/[slug]/page';
import { generateMetadata as categoryMetadata } from './(shop)/products/[category]/page';
import { generateMetadata as discountsMetadata } from './(shop)/products/discounts/page';
import { generateMetadata as productsMetadata } from './(shop)/products/page';
import { generateMetadata as searchMetadata } from './(shop)/search/page';
import { generateMetadata as termsMetadata } from './(shop)/terms/page';
import { generateMetadata as adminMetadata } from './admin/page';

import type { Locale } from 'next-intl';

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(),
  getProduct: vi.fn(),
}));

vi.mock('@pages/home', () => ({ default: () => null }));
vi.mock('@pages/products/all', () => ({
  default: () => null,
  ProductDiscountsPage: () => null,
}));
vi.mock('@pages/policy/terms', () => ({ default: () => null }));
vi.mock('@pages/policy/privacy', () => ({ default: () => null }));
vi.mock('@pages/policy/cookies', () => ({ default: () => null }));
vi.mock('@pages/login', () => ({ default: () => null }));
vi.mock('@pages/admin/ui/AdminRoutePage', () => ({ default: () => null }));
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
    namespace:
      | 'Metadata'
      | 'Products.allHero.all'
      | 'Products.allHero.discounts'
      | 'Policy.terms'
      | 'Policy.privacy'
      | 'Policy.cookies';
  }) =>
    createTranslator({
      locale,
      messages: locale === 'en' ? enMessages : koMessages,
      namespace,
    }),
}));
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

for (const { locale, messages } of [
  { locale: 'ko', messages: koMessages },
  { locale: 'en', messages: enMessages },
] as const) {
  describe(`${locale} 정적 공개 페이지 metadata`, () => {
    it.each([
      {
        pathname: '/',
        generate: homeMetadata,
        title: { absolute: 'Daily Device' },
        description: messages.Metadata.homeDescription,
      },
      {
        pathname: '/products',
        generate: productsMetadata,
        ...messages.Products.allHero.all,
      },
      {
        pathname: '/products/discounts',
        generate: discountsMetadata,
        ...messages.Products.allHero.discounts,
      },
      {
        pathname: '/terms',
        generate: termsMetadata,
        ...messages.Policy.terms,
      },
      {
        pathname: '/privacy',
        generate: privacyMetadata,
        ...messages.Policy.privacy,
      },
      {
        pathname: '/cookies',
        generate: cookiesMetadata,
        ...messages.Policy.cookies,
      },
    ])(
      '$pathname의 문구를 유지하고 query 없는 self canonical과 대칭 hreflang을 제공한다',
      async ({ pathname, generate, title, description }) => {
        const props = {
          params: Promise.resolve({ locale }),
          searchParams: Promise.resolve({ sort: 'price_asc' }),
        };
        const koreanUrl = `https://daily-device.vercel.app${pathname}`;
        const englishUrl = `https://daily-device.vercel.app/en${pathname === '/' ? '' : pathname}`;

        expect(await generate(props)).toEqual({
          title,
          description,
          alternates: {
            canonical: locale === 'ko' ? koreanUrl : englishUrl,
            languages: { ko: koreanUrl, en: englishUrl },
          },
        });
      },
    );
  });
}

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
        params: Promise.resolve({ locale, category: ' %6Dice ' }),
      });

      expect(metadata.title).toBe(name);
      expect(metadata.description).toContain(name);
      expect(mocks.getCategory).toHaveBeenCalledWith('mice', locale);
      expect(metadata.robots).toBeUndefined();
      expect(metadata.alternates).toEqual({
        canonical:
          locale === 'ko'
            ? 'https://daily-device.vercel.app/products/mice'
            : 'https://daily-device.vercel.app/en/products/mice',
        languages: {
          ko: 'https://daily-device.vercel.app/products/mice',
          en: 'https://daily-device.vercel.app/en/products/mice',
        },
      });
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
  ] as const)(
    '상품의 $locale 이름과 설명을 재사용한다',
    async ({ locale, name, description }) => {
      mocks.getProduct.mockResolvedValue({
        product: {
          name_en: name,
          description,
          slug: 'breeze-mouse-desk',
          category: { slug: 'mice' },
        },
      });

      const metadata = await productMetadata({
        params: Promise.resolve({
          locale,
          category: ' mice ',
          slug: 'test%20mouse',
        }),
      });

      expect(metadata).toEqual({
        title: name,
        description,
        alternates: {
          canonical:
            locale === 'ko'
              ? 'https://daily-device.vercel.app/products/mice/breeze-mouse-desk'
              : 'https://daily-device.vercel.app/en/products/mice/breeze-mouse-desk',
          languages: {
            ko: 'https://daily-device.vercel.app/products/mice/breeze-mouse-desk',
            en: 'https://daily-device.vercel.app/en/products/mice/breeze-mouse-desk',
          },
        },
      });
      expect(mocks.getProduct).toHaveBeenCalledWith('test mouse', locale);
    },
  );

  it('정규화한 category와 DB product slug를 한 번만 인코딩한다', async () => {
    mocks.getCategory.mockResolvedValue({ id: 1, name: 'Gaming Mice' });
    mocks.getProduct.mockResolvedValue({
      product: {
        name_en: 'Desk Mouse',
        description: 'Product description',
        slug: 'desk mouse%edition?#',
        category: { slug: 'gaming mice' },
      },
    });
    const category = ' %67aming%20mice ';
    const categoryResult = await categoryMetadata({
      params: Promise.resolve({ locale: 'en', category }),
    });
    const productResult = await productMetadata({
      params: Promise.resolve({
        locale: 'en',
        category,
        slug: 'desk%20mouse%25edition%3F%23',
      }),
    });

    expect(categoryResult.alternates?.canonical).toBe(
      'https://daily-device.vercel.app/en/products/gaming%20mice',
    );
    expect(productResult.alternates).toEqual({
      canonical:
        'https://daily-device.vercel.app/en/products/gaming%20mice/desk%20mouse%25edition%3F%23',
      languages: {
        ko: 'https://daily-device.vercel.app/products/gaming%20mice/desk%20mouse%25edition%3F%23',
        en: 'https://daily-device.vercel.app/en/products/gaming%20mice/desk%20mouse%25edition%3F%23',
      },
    });
    expect(mocks.getCategory).toHaveBeenCalledWith('gaming mice', 'en');
    expect(mocks.getProduct).toHaveBeenCalledWith('desk mouse%edition?#', 'en');
  });

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
      expect(await loginMetadata(props)).toEqual({
        title: messages.login,
        robots: { index: false, follow: false },
      });
      expect(await adminMetadata(props)).toEqual({
        title: messages.admin,
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
