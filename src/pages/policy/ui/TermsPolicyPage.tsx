import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

export default async function TermsPolicyPage() {
  const policy = await getPolicy('terms');

  return <PolicyPage {...policy} />;
}
