import { useCallback, useEffect, useRef } from 'react';

import { useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@shared/lib/i18n/navigation';

type QueryParamValue = string | null | undefined;
type NavigationStrategy = 'history' | 'router';

export const useQueryParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const navigate = useCallback(
    (
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
    },
    [pathname, router],
  );

  const setParam = useCallback(
    (
      key: string,
      value: QueryParamValue,
      replace = true,
      strategy: NavigationStrategy = 'history',
    ) => {
      const params = new URLSearchParams(searchParamsRef.current?.toString());
      if (value == null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      navigate(params, replace, strategy);
    },
    [navigate],
  );

  const setParams = useCallback(
    (
      updates: Record<string, QueryParamValue>,
      replace = true,
      strategy: NavigationStrategy = 'history',
    ) => {
      const params = new URLSearchParams(searchParamsRef.current?.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value == null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      navigate(params, replace, strategy);
    },
    [navigate],
  );

  return { setParam, setParams };
};
