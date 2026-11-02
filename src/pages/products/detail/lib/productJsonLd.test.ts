import { describe, expect, it } from 'vitest';

import { getProductPriceInfo } from '@shared/lib/price/discount';

import { createProductJsonLd, serializeProductJsonLd } from './productJsonLd';

const product = {
  name_en: '브리즈 마우스',
  slug: 'breeze-mouse-desk',
  description: '일상용 무선 마우스',
  category: { name_en: '마우스', slug: 'mice' },
  ...getProductPriceInfo(50000, 20),
};
const images = [
  {
    image_url: 'https://res.cloudinary.com/daily-device/image/upload/mouse.png',
  },
  {
    image_url:
      'https://res.cloudinary.com/daily-device/image/upload/mouse-side.png',
  },
];

describe('Product JSON-LD', () => {
  it.each([
    {
      locale: 'ko',
      name: '브리즈 마우스',
      description: '일상용 무선 마우스',
      category: '마우스',
      url: 'https://daily-device.vercel.app/products/mice/breeze-mouse-desk',
    },
    {
      locale: 'en',
      name: 'Breeze Mouse',
      description: 'A wireless mouse for everyday use',
      category: 'Mice',
      url: 'https://daily-device.vercel.app/en/products/mice/breeze-mouse-desk',
    },
  ] as const)(
    '$locale 콘텐츠·canonical URL·현재 할인 가격만 구조화한다',
    ({ locale, name, description, category, url }) => {
      const jsonLd = createProductJsonLd({
        locale,
        product: {
          ...product,
          name_en: name,
          description,
          category: { ...product.category, name_en: category },
        },
        images,
      });

      expect(jsonLd).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${url}#product`,
        url,
        name,
        description,
        image: images.map(({ image_url }) => image_url),
        category,
        offers: {
          '@type': 'Offer',
          url,
          price: 40000,
          priceCurrency: 'KRW',
        },
      });
    },
  );

  it('할인하지 않는 상품도 표시용 문자열 대신 현재 숫자 가격을 사용한다', () => {
    const jsonLd = createProductJsonLd({
      locale: 'ko',
      product: { ...product, ...getProductPriceInfo(50000, 0) },
      images,
    });

    expect(jsonLd?.offers.price).toBe(50000);
    expect(typeof jsonLd?.offers.price).toBe('number');
  });

  it('빈 이미지를 제거하고 실제 이미지 URL을 중복 없이 반환한다', () => {
    const jsonLd = createProductJsonLd({
      locale: 'ko',
      product,
      images: [
        { image_url: '' },
        { image_url: '   ' },
        images[0],
        { image_url: ` ${images[0].image_url} ` },
        images[1],
      ],
    });

    expect(jsonLd?.image).toEqual(images.map(({ image_url }) => image_url));
  });

  it.each([
    { images: [] },
    { images: [{ image_url: '' }, { image_url: '  ' }] },
  ])(
    '실제 이미지가 없으면 fallback이나 불완전한 Product를 생성하지 않는다: %j',
    ({ images }) => {
      expect(createProductJsonLd({ locale: 'ko', product, images })).toBeNull();
    },
  );

  it.each([0, -1, NaN, Infinity, -Infinity])(
    '유효하지 않은 판매 가격 %s에는 Product를 생성하지 않는다',
    (price) => {
      expect(
        createProductJsonLd({
          locale: 'ko',
          product: { ...product, price },
          images,
        }),
      ).toBeNull();
    },
  );

  it('slug를 한 번 인코딩하고 상품 URL과 offers.url에 query·fragment를 넣지 않는다', () => {
    const jsonLd = createProductJsonLd({
      locale: 'en',
      product: {
        ...product,
        slug: 'desk mouse%edition?#',
        category: { name_en: 'Gaming Mice', slug: 'gaming mice' },
      },
      images,
    });
    const expectedUrl =
      'https://daily-device.vercel.app/en/products/gaming%20mice/desk%20mouse%25edition%3F%23';

    expect(jsonLd?.url).toBe(expectedUrl);
    expect(jsonLd?.offers.url).toBe(expectedUrl);
    expect(jsonLd?.['@id']).toBe(`${expectedUrl}#product`);
    expect(new URL(jsonLd!.url).search).toBe('');
    expect(new URL(jsonLd!.url).hash).toBe('');
  });

  it('문자열의 <를 escape해 script 종료나 추가 script 삽입을 막고 JSON은 보존한다', () => {
    const injectedText = '</script><script id="injected">alert(1)</script>';
    const jsonLd = createProductJsonLd({
      locale: 'ko',
      product: {
        ...product,
        name_en: injectedText,
        description: injectedText,
        category: { ...product.category, name_en: injectedText },
      },
      images,
    });
    const serialized = serializeProductJsonLd(jsonLd!);
    const container = document.createElement('div');
    container.innerHTML = `<script type="application/ld+json">${serialized}</script>`;

    expect(serialized).not.toContain('<');
    expect(serialized).toContain('\\u003c/script>');
    expect(JSON.parse(serialized)).toEqual(jsonLd);
    expect(container.querySelectorAll('script')).toHaveLength(1);
    expect(container.querySelector('#injected')).toBeNull();
  });
});
