import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

export default async function PrivacyPolicyPage() {
  const policy = await getPolicy('privacy');

  return <PolicyPage {...policy} />;
}
