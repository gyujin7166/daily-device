import type { ComponentProps, PropsWithChildren } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';

import koMessages from '../messages/ko.json';

import type { Locale } from 'next-intl';

type TestMessages<T> = {
  [Key in keyof T]?: T[Key] extends string ? string : TestMessages<T[Key]>;
};

type TestIntlProviderProps = PropsWithChildren<{
  locale: Locale;
  messages: TestMessages<typeof koMessages>;
}>;

type IntlProviderMessages = ComponentProps<
  typeof NextIntlClientProvider
>['messages'];

export function TestIntlProvider({
  children,
  locale,
  messages,
}: TestIntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages as unknown as IntlProviderMessages}
    >
      {children}
    </NextIntlClientProvider>
  );
}

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
