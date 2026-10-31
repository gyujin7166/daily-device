import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getPageAlternates } from '@app/metadata/alternates';

import type { Locale } from 'next-intl';

export { default } from '@pages/policy/terms';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Policy.terms' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: getPageAlternates(locale, '/terms'),
  };
}
