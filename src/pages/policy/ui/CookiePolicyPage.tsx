import { getPolicy } from '../model/policies';

import PolicyPage from './PolicyPage';

export default async function CookiePolicyPage() {
  const policy = await getPolicy('cookies');

  return <PolicyPage {...policy} />;
}
