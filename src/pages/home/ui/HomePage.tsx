import { HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { getHomeSections } from '@app/api-routes/home/sections/service';
import { getHeroList } from '@app/api-routes/products/hero/service';

import { homeQueryKeys } from '@entities/home/queries/queryKeys';
import { productQueryKeys } from '@entities/product/queries/queryKeys';

import { toSupportedLocale } from '@shared/lib/i18n/locale';
import { dehydrateWithPending } from '@shared/lib/query/dehydrateWithPending';

import HomePageContent from './HomePageContent';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeValue } = await params;
  const locale = toSupportedLocale(localeValue);
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: productQueryKeys.hero('main', undefined, locale),
      queryFn: () => getHeroList('main', undefined, locale),
      staleTime: 60 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: homeQueryKeys.sections([], locale),
      queryFn: () => getHomeSections({ locale }),
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
