import { getTranslations } from 'next-intl/server';

import { toSupportedLocale } from '@shared/lib/i18n/locale';

export type PolicySection = {
  title: string;
  items: string[];
};

export type Policy = {
  title: string;
  description: string;
  updatedAt: string;
  sections: PolicySection[];
};

export type PolicyKey = 'terms' | 'privacy' | 'cookies';

export async function getPolicy(
  policyKey: PolicyKey,
  localeValue: string,
): Promise<Policy> {
  const locale = toSupportedLocale(localeValue);
  const t = await getTranslations({
    locale,
    namespace: `Policy.${policyKey}`,
  });

  return {
    title: t('title'),
    description: t('description'),
    updatedAt: t('updatedAt'),
    sections: t.raw('sections') as PolicySection[],
  };
}
