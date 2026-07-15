import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import localFont from 'next/font/local';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import '@app/styles/globals.css';

import Providers from '@app/providers';
import { themeInitScript } from '@app/theme/themeInitScript';

import { routing } from '../../src/i18n/routing';

const pretendard = localFont({
  src: [
    {
      path: '../../src/shared/assets/fonts/PretendardVariable.woff2',
      weight: '45 920',
      style: 'normal',
    },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Daily Device',
  description: 'Daily Device',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicons/favicon-64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [
      {
        url: '/favicons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${pretendard.className} bg-canvas text-ink dark:bg-dark-bg dark:text-surface`}
      >
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
