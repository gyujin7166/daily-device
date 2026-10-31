import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import { getPageAlternates } from '@app/metadata/alternates';

import type { Locale } from 'next-intl';

export { default } from '@pages/policy/privacy';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Policy.privacy' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: getPageAlternates(locale, '/privacy'),
  };
}
