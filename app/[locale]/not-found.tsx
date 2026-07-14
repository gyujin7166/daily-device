import { getLocale, getTranslations } from 'next-intl/server';

import NotFoundPage from '@pages/not-found';

export default async function LocaleNotFound() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('NotFound'),
  ]);

  return (
    <NotFoundPage
      title={t('title')}
      descriptionLine1={t('descriptionLine1')}
      descriptionLine2={t('descriptionLine2')}
      homeLabel={t('home')}
      homeHref={`/${locale}`}
    />
  );
}
