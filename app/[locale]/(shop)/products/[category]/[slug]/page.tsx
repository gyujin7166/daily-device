import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { getProductDetailBySlug } from '@app/api-routes/products/[slug]/service';
import { getPageAlternates } from '@app/metadata/alternates';

import type { Locale } from 'next-intl';

export { default, generateStaticParams } from '@pages/products/detail';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  const { product } = await getProductDetailBySlug(
    decodeURIComponent(slug),
    locale,
  );

  if (
    !product ||
    product.category.slug !== decodeURIComponent(category).trim()
  ) {
    notFound();
  }

  return {
    title: product.name_en,
    description: product.description,
    alternates: getPageAlternates(
      locale,
      `/products/${encodeURIComponent(product.category.slug)}/${encodeURIComponent(product.slug)}`,
    ),
  };
}
