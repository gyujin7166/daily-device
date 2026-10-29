import type { Metadata } from 'next';

import { getTranslations } from 'next-intl/server';

import type { Locale } from 'next-intl';

export { default } from '@pages/admin/ui/AdminRoutePage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('admin'),
    robots: { index: false, follow: false },
  };
}
