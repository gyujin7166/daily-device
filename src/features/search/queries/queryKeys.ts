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
  ) =>
    [
      ...searchQueryKeys.all,
      'results',
      keyword,
      categoriesKey,
      sort,
      limit,
    ] as const,
};
