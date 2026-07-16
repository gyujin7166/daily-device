'use client';

import { usePathname } from 'next/navigation';

import enMessages from '../../../../messages/en.json';
import koMessages from '../../../../messages/ko.json';

import NotFoundPage from './NotFoundPage';

const getNotFoundLocale = (pathname: string) =>
  pathname.split('/')[1] === 'en' ? 'en' : 'ko';

export default function GlobalNotFoundPage() {
  const pathname = usePathname() ?? '';
  const locale = getNotFoundLocale(pathname);
  const messages = locale === 'en' ? enMessages.NotFound : koMessages.NotFound;

  return (
    <NotFoundPage
      title={messages.title}
      descriptionLine1={messages.descriptionLine1}
      descriptionLine2={messages.descriptionLine2}
      homeLabel={messages.home}
      homeHref={`/${locale}`}
      forceDocumentNavigation
    />
  );
}
