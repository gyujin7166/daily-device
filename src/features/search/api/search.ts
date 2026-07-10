import { fetchApi, fetchApiResponse } from '@shared/api/fetchApi';

import type {
  SearchResultItem,
  SearchSortOption,
  SearchSuggestionItem,
} from '../model/types';

type SearchResultPageResponse = {
  items: SearchResultItem[];
  total: number;
  baseTotal: number;
  page: number;
  limit: number;
  hasMore: boolean;
  availableCategories: string[];
};

export const getSearchSuggestions = (
  debouncedKeyword: string,
): Promise<SearchSuggestionItem[]> => {
  const params = new URLSearchParams({ keyword: debouncedKeyword });
  return fetchApi(`/api/search/suggestions?${params.toString()}`);
};

export const getSearchPage = ({
  keyword,
  categories,
  sort,
  page,
  limit,
  locale,
}: {
  keyword: string;
  categories: string[];
  sort: SearchSortOption;
  page: number;
  limit: number;
  locale?: string;
}): Promise<SearchResultPageResponse> => {
  const params = new URLSearchParams({
    keyword,
    page: `${page}`,
    limit: `${limit}`,
    sort,
  });

  if (categories.length > 0) {
    params.set('categories', categories.join(','));
  }
  if (locale) {
    params.set('locale', locale);
  }

  return fetchApiResponse(`/api/search/results?${params.toString()}`);
};
