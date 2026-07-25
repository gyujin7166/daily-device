import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

type PrivacyPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PrivacyPolicyPage({
  params,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  const policy = await getPolicy('privacy', locale);

  return <PolicyPage {...policy} />;
}
