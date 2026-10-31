import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getPageAlternates } from '@app/metadata/alternates';

import type { Locale } from 'next-intl';

export { default } from '@pages/products/all';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'Products.allHero.all',
  });

  return {
    title: t('title'),
    description: t('description'),
    alternates: getPageAlternates(locale, '/products'),
  };
}
