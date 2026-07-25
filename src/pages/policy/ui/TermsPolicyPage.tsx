import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

type TermsPolicyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPolicyPage({
  params,
}: TermsPolicyPageProps) {
  const { locale } = await params;
  const policy = await getPolicy('terms', locale);

  return <PolicyPage {...policy} />;
}
