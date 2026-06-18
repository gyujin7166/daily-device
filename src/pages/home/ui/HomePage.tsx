import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getHomeSections } from '@app/api-routes/home/sections/service';
import { getHeroList } from '@app/api-routes/products/hero/service';

import { homeQueryKeys } from '@entities/home/queries/queryKeys';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import HomePageContent from './HomePageContent';

export default async function HomePage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.hero('main'),
      queryFn: () => getHeroList('main'),
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: homeQueryKeys.sections(),
      queryFn: () => getHomeSections(),
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrateWithPending(queryClient)}>
      <HomePageContent />
    </HydrationBoundary>
  );
}
