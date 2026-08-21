import { useLayoutEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import localFont from 'next/font/local';

import { withThemeByClassName } from '@storybook/addon-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';

import messagesEn from '../messages/en.json';
import messagesKo from '../messages/ko.json';
import { applyTheme, THEME_STORAGE_KEY } from '../src/shared/lib/theme/theme';

import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/styles/globals.css';

const pretendard = localFont({
  src: '../src/shared/assets/fonts/PretendardVariable.woff2',
  weight: '45 920',
  style: 'normal',
  display: 'swap',
});

const messagesByLocale = {
  en: messagesEn,
  ko: messagesKo,
};

type StorybookProvidersProps = PropsWithChildren<{
  locale: keyof typeof messagesByLocale;
}>;

type StorybookThemeSyncProps = PropsWithChildren<{
  theme: 'dark' | 'light';
}>;

function StorybookThemeSync({ children, theme }: StorybookThemeSyncProps) {
  useLayoutEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
  }, [theme]);

  return children;
}

function StorybookProviders({ children, locale }: StorybookProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messagesByLocale[locale]}
      timeZone="Asia/Seoul"
    >
      <QueryClientProvider client={queryClient}>
        <SessionProvider
          session={null}
          refetchInterval={0}
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <div
            className={`${pretendard.className} min-h-screen bg-canvas p-6 text-ink dark:bg-dark-bg dark:text-surface`}
          >
            {children}
          </div>
        </SessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'UI locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ko', title: '한국어' },
          { value: 'en', title: 'English' },
        ],
      },
    },
  },
  initialGlobals: {
    locale: 'ko',
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story, context) => {
      const locale = context.globals.locale === 'en' ? 'en' : 'ko';
      const theme = context.globals.theme === 'dark' ? 'dark' : 'light';

      return (
        <StorybookThemeSync theme={theme}>
          <StorybookProviders key={`${context.id}-${locale}`} locale={locale}>
            <Story />
          </StorybookProviders>
        </StorybookThemeSync>
      );
    },
  ],
  loaders: [mswLoader()],
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'fullscreen',
  },
};

export default preview;
