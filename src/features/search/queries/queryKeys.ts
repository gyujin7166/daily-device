import type { SearchSortOption } from '../model/types';

export const searchQueryKeys = {
  all: ['search'] as const,
  suggestions: (keyword: string) =>
    [...searchQueryKeys.all, 'suggestions', keyword] as const,
  results: (
    keyword: string,
    categoriesKey: string,
    sort: SearchSortOption,
    limit: number,
    locale?: string,
  ) =>
    [
      ...searchQueryKeys.all,
      'results',
      keyword,
      categoriesKey,
      sort,
      limit,
      locale,
    ] as const,
};
