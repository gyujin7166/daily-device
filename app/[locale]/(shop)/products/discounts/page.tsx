import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getPageAlternates } from '@app/metadata/alternates';

import { ProductDiscountsPage } from '@pages/products/all';

import type { Locale } from 'next-intl';

export default ProductDiscountsPage;

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'Products.allHero.discounts',
  });

  return {
    title: t('title'),
    description: t('description'),
    alternates: getPageAlternates(locale, '/products/discounts'),
  };
}
