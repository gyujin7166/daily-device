import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

type CookiePolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CookiePolicyPage({
  params,
}: CookiePolicyPageProps) {
  const { locale } = await params;
  const policy = await getPolicy('cookies', locale);

  return <PolicyPage {...policy} />;
}
