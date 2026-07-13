import { HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getLocale } from 'next-intl/server';

import { getSearchResultPage } from '@app/api-routes/search/results/service';

import { searchQueryKeys } from '@features/search/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';
import { decodeSlugToText } from '@shared/lib/router/slug';

import SearchPageContainer from './SearchPageContainer';

type SearchPageProps = {
  searchParams: Promise<{ query: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { query } = await searchParams;
  const decodedQuery = decodeSlugToText(query);
  const locale = await getLocale();
  const queryClient = new QueryClient();

  if (decodedQuery.trim().length > 0) {
    await queryClient.prefetchInfiniteQuery({
      queryKey: searchQueryKeys.results(
        decodedQuery,
        '',
        'relevance',
        12,
        locale,
      ),
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        getSearchResultPage({
          keyword: decodedQuery,
          page: Number(pageParam),
          limit: 12,
          categories: [],
          sort: 'relevance',
          locale,
        }),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    });
  }

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <SearchPageContainer query={query} />
    </HydrationBoundary>
  );
}
