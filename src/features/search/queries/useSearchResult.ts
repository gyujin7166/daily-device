import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { getQueryPageParam } from '@shared/lib/query/getQueryPageParam';
import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';
import { decodeSlugToText } from '@shared/lib/router/slug';

import { getSearchPage } from '../api/search';

import { searchQueryKeys } from './queryKeys';

import type { SearchSortOption } from '../model/types';

type UseSearchResultParams = {
  keyword: string;
  categories?: string[];
  sort?: SearchSortOption;
  limit?: number;
};

export const useSearchResult = ({
  keyword,
  categories = [],
  sort = 'relevance',
  limit = 12,
}: UseSearchResultParams) => {
  const locale = useLocale();
  const decodeKeyword = decodeSlugToText(keyword);
  const normalizedCategories = [...categories].sort();
  const categoriesKey = normalizedCategories.join(',');

  const query = useInfiniteQuery({
    queryKey: searchQueryKeys.results(
      decodeKeyword,
      categoriesKey,
      sort,
      limit,
      locale,
    ),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getSearchPage({
        keyword: decodeKeyword,
        categories: normalizedCategories,
        sort,
        page: getQueryPageParam(pageParam),
        limit,
        locale,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: !!decodeKeyword && decodeKeyword.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: shouldRetryQuery,
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const baseTotal = query.data?.pages[0]?.baseTotal ?? 0;
  const availableCategories = query.data?.pages[0]?.availableCategories ?? [];

  return {
    ...query,
    data: items,
    total,
    baseTotal,
    availableCategories,
    pageSize: limit,
  };
};
