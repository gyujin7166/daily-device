import type { MetadataRoute } from 'next';

import {
  getStaticProductCategoryParams,
  getStaticProductDetailParams,
} from '@app/api-routes/products/static-params/service';

import { routing } from '@shared/config/i18n/routing';
import { SITE_ORIGIN } from '@shared/config/site';
import { getPathname } from '@shared/lib/i18n/navigation';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getStaticProductCategoryParams(),
    getStaticProductDetailParams(),
  ]);
  const publicCategories = new Set(categories.map(({ category }) => category));
  const paths = [
    '/',
    '/products',
    '/products/discounts',
    '/terms',
    '/privacy',
    '/cookies',
    ...categories.map(
      ({ category }) => `/products/${encodeURIComponent(category)}`,
    ),
    ...products
      .filter(({ category }) => publicCategories.has(category))
      .map(
        ({ category, slug }) =>
          `/products/${encodeURIComponent(category)}/${encodeURIComponent(slug)}`,
      ),
  ];
  const urls = routing.locales.flatMap((locale) =>
    paths.map((href) =>
      new URL(getPathname({ locale, href }), SITE_ORIGIN).toString(),
    ),
  );

  return [...new Set(urls)].map((url) => ({ url }));
}
