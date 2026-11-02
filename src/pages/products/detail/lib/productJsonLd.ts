import type {
  ProductDetailResponse,
  ProductImageItem,
} from '@entities/product/model/types';

import type { Locale } from '@shared/config/i18n/routing';
import { getLocalizedPageUrl } from '@shared/lib/seo/getLocalizedPageUrl';

type Product = NonNullable<ProductDetailResponse['product']>;
type ProductJsonLdInput = {
  locale: Locale;
  product: Pick<Product, 'name_en' | 'slug' | 'description' | 'price'> & {
    category: Pick<Product['category'], 'name_en' | 'slug'>;
  };
  images: Pick<ProductImageItem, 'image_url'>[];
};

export function createProductJsonLd({
  locale,
  product,
  images,
}: ProductJsonLdInput) {
  if (!Number.isFinite(product.price) || product.price <= 0) {
    return null;
  }

  const image = [
    ...new Set(images.map(({ image_url }) => image_url.trim()).filter(Boolean)),
  ];

  if (image.length === 0) {
    return null;
  }

  const url = getLocalizedPageUrl(
    locale,
    `/products/${encodeURIComponent(product.category.slug)}/${encodeURIComponent(product.slug)}`,
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    url,
    name: product.name_en,
    description: product.description,
    image,
    category: product.category.name_en,
    offers: {
      '@type': 'Offer',
      url,
      price: product.price,
      priceCurrency: 'KRW',
    },
  } as const;
}

export function serializeProductJsonLd(
  jsonLd: NonNullable<ReturnType<typeof createProductJsonLd>>,
): string {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c');
}
