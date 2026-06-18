import 'server-only';

import { UnauthorizedError } from '@shared/lib/errors/httpError';

import { auth } from 'auth';

export async function getRequiredUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
