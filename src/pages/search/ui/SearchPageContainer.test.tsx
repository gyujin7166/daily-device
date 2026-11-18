import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import koMessages from '../../../../messages/ko.json';
import {
  createTestQueryClient,
  TestIntlProvider,
} from '../../../../test/render';

import SearchPageContainer from './SearchPageContainer';

const useSearchResult = vi.hoisted(() => vi.fn());

vi.mock('@features/search/queries/useSearchResult', () => ({
  useSearchResult,
}));
vi.mock('@features/search/ui', () => ({
  SearchHeader: () => <h1>search results</h1>,
  SearchHeaderSkeleton: () => <div>search header loading</div>,
  SearchFilterControls: () => <div>search filters</div>,
}));
vi.mock('./SearchResults', () => ({
  default: () => <div>search result items</div>,
}));

function searchResult(isPending: boolean) {
  return {
    data: [],
    total: 0,
    baseTotal: 0,
    availableCategories: [],
    isPending,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  };
}

function renderContainer() {
  const queryClient = createTestQueryClient();
  const ui = () => (
    <TestIntlProvider
      locale="ko"
      messages={{ AiProductAssistant: koMessages.AiProductAssistant }}
    >
      <QueryClientProvider client={queryClient}>
        <SearchPageContainer query="mouse" />
      </QueryClientProvider>
    </TestIntlProvider>
  );
  const { rerender } = render(ui());

  return { rerender: () => rerender(ui()) };
}

describe('SearchPageContainer', () => {
  beforeEach(() => {
    useSearchResult.mockReset();
  });

  it('첫 검색 결과가 로딩되는 동안 AI 도우미에 입력한 질문을 결과 표시 후에도 유지한다', async () => {
    const user = userEvent.setup();
    useSearchResult.mockReturnValue(searchResult(true));
    const { rerender } = renderContainer();

    expect(screen.getByText('search header loading')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), '큰 손에 맞는 마우스');

    useSearchResult.mockReturnValue(searchResult(false));
    rerender();

    expect(await screen.findByText('search result items')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('큰 손에 맞는 마우스');
  });
});
