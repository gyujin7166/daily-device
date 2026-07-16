import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import NoSearchResults from './NoSearchResults';

const messagesByLocale = {
  ko: {
    Search: {
      results: {
        emptyTitle: '{query}에 대한 검색 결과가 없습니다.',
        emptyDescription: '다른 용어로 검색해보세요.',
      },
    },
  },
  en: {
    Search: {
      results: {
        emptyTitle: 'No results for {query}',
        emptyDescription: 'Try searching with another term.',
      },
    },
  },
} as const;

describe('NoSearchResults', () => {
  it.each([
    {
      locale: 'ko' as const,
      query: '키보드',
      title: '키보드에 대한 검색 결과가 없습니다.',
      description: '다른 용어로 검색해보세요.',
    },
    {
      locale: 'en' as const,
      query: 'keyboard',
      title: 'No results for keyboard',
      description: 'Try searching with another term.',
    },
  ])(
    '$locale 빈 검색 결과 문구에 검색어를 보간한다',
    ({ locale, query, title, description }) => {
      render(
        <NextIntlClientProvider
          locale={locale}
          messages={messagesByLocale[locale]}
        >
          <NoSearchResults searchTerm={query} />
        </NextIntlClientProvider>,
      );

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(
        screen.getByText(description, { exact: true }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/\{query\}/)).not.toBeInTheDocument();
    },
  );
});
