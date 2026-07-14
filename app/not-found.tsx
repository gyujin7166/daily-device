import '@app/styles/globals.css';

import localFont from 'next/font/local';

import { GlobalNotFoundPage } from '@pages/not-found';

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

export default function NotFound() {
  return (
    <div className={pretendard.className}>
      <GlobalNotFoundPage />
    </div>
  );
}
