'use client';

import { useServerInsertedHTML } from 'next/navigation';

import { themeInitScript } from './themeInitScript';

export default function ThemeInitScriptInjection() {
  useServerInsertedHTML(() => (
    <script
      id="theme-init"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  ));

  return null;
}
