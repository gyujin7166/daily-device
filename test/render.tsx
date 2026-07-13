import type { PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        retryDelay: 0,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

export const createQueryWrapper = (queryClient: QueryClient) => {
  function QueryWrapper({ children }: PropsWithChildren) {
    return (
      <NextIntlClientProvider locale="ko" messages={{}}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </NextIntlClientProvider>
    );
  }

  return QueryWrapper;
};
