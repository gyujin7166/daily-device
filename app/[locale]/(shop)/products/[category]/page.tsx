import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { getTranslations } from 'next-intl/server';

import { getProductCategoryBySlug } from '@app/api-routes/products/filters/service';
import { getPageAlternates } from '@app/metadata/alternates';

import type { Locale } from 'next-intl';

export { default, generateStaticParams } from '@pages/products/category';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const normalizedCategory = decodeURIComponent(category).trim();
  const productCategory = await getProductCategoryBySlug(
    normalizedCategory,
    locale,
  );

  if (!productCategory) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: productCategory.name,
    description: t('categoryDescription', { category: productCategory.name }),
    alternates: getPageAlternates(
      locale,
      `/products/${encodeURIComponent(normalizedCategory)}`,
    ),
  };
}
