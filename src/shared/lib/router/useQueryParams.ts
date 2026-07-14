import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@shared/lib/i18n/navigation';

type QueryParamValue = string | null | undefined;
type NavigationStrategy = 'history' | 'router';

export const useQueryParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigate = (
    params: URLSearchParams,
    replace = true,
    strategy: NavigationStrategy = 'history',
  ) => {
    const resolvedPathname = pathname || '/';
    const query = params.toString();
    const url = query ? `${resolvedPathname}?${query}` : resolvedPathname;

    if (strategy === 'history' && typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState(null, '', url);
      } else {
        window.history.pushState(null, '', url);
      }
      return;
    }

    replace ? router.replace(url, { scroll: false }) : router.push(url);
  };

  const setParam = (
    key: string,
    value: QueryParamValue,
    replace = true,
    strategy: NavigationStrategy = 'history',
  ) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value == null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    navigate(params, replace, strategy);
  };

  const setParams = (
    updates: Record<string, QueryParamValue>,
    replace = true,
    strategy: NavigationStrategy = 'history',
  ) => {
    const params = new URLSearchParams(searchParams?.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    navigate(params, replace, strategy);
  };

  return { setParam, setParams };
};
