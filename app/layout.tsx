import type { PropsWithChildren } from 'react';

import type { Metadata } from 'next';

import localFont from 'next/font/local';

import '@app/styles/globals.css';

import Providers from '@app/providers';
import { themeInitScript } from '@app/theme/themeInitScript';

const pretendard = localFont({
  src: [
    {
      path: '../src/shared/assets/fonts/PretendardVariable.woff2',
      weight: '45 920',
      style: 'normal',
    },
  ],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ecommerce',
  description: 'ecommerce',
};

type RootLayoutProps = PropsWithChildren;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className={`${pretendard.className} bg-canvas text-ink dark:bg-dark-bg dark:text-surface`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
