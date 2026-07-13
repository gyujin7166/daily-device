import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';


import { useSession } from 'next-auth/react';

import { getLoginRedirectPath } from '@shared/lib/authRedirect';
import { usePathname, useRouter } from '@shared/lib/i18n/navigation';
import { createCurrentPath } from '@shared/lib/router/currentPath';

export const useRequireAuth = () => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = createCurrentPath(pathname, searchParams);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const loginPath = getLoginRedirectPath(currentPath);
      router.replace(loginPath);
    }
  }, [currentPath, router, status]);
};
