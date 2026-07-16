import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';

import SearchHeader from './SearchHeader';

const messagesByLocale = {
  ko: {
    Search: {
      results: {
        fallbackQuery: '상품',
        title: '{query} 검색 결과',
        total: '전체 {count}개',
        description: '{query}와 관련된 상품을 모두 확인해보세요.',
      },
    },
  },
  en: {
    Search: {
      results: {
        fallbackQuery: 'products',
        title: 'Search results for {query}',
        total: '{count} total',
        description: 'Browse all products related to {query}.',
      },
    },
  },
} as const;

describe('SearchHeader', () => {
  it.each([
    {
      locale: 'ko' as const,
      title: '키보드 검색 결과',
      total: '전체 18개',
      description: '키보드와 관련된 상품을 모두 확인해보세요.',
    },
    {
      locale: 'en' as const,
      title: 'Search results for keyboard',
      total: '18 total',
      description: 'Browse all products related to keyboard.',
    },
  ])(
    '$locale 검색 결과 문구에 검색어를 보간한다',
    ({ locale, title, total, description }) => {
      const query = locale === 'ko' ? '키보드' : 'keyboard';

      render(
        <NextIntlClientProvider
          locale={locale}
          messages={messagesByLocale[locale]}
        >
          <SearchHeader decodedQuery={query} totalItems={18} />
        </NextIntlClientProvider>,
      );

      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
      expect(screen.getByText(total, { exact: true })).toBeInTheDocument();
      expect(
        screen.getByText(description, { exact: true }),
      ).toBeInTheDocument();
      expect(screen.queryByText(/\{query\}/)).not.toBeInTheDocument();
    },
  );
});
