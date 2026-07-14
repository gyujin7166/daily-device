import { getTranslations } from 'next-intl/server';

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

export async function getPolicy(policyKey: PolicyKey): Promise<Policy> {
  const t = await getTranslations(`Policy.${policyKey}`);

  return {
    title: t('title'),
    description: t('description'),
    updatedAt: t('updatedAt'),
    sections: t.raw('sections') as PolicySection[],
  };
}
