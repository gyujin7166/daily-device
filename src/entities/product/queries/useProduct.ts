import { useParams, useSearchParams } from 'next/navigation';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { getProductPage } from '@entities/product/api/product';
import { PRODUCT_LIST_STALE_TIME_MS } from '@entities/product/constants/cache';
import { PRODUCT_PAGE_SIZE } from '@entities/product/constants/pagination';
import type { ProductSortOption } from '@entities/product/model/sort';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { productQueryKeys } from './queryKeys';

type UseProductParams = {
  sort?: ProductSortOption;
  category?: string | null;
  filters?: string[];
  colorIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  discountedOnly?: boolean;
  enabled?: boolean;
  initialLimit?: number;
  pageSize?: number;
};

type ProductPageParam =
  | number
  | {
      page: number;
      limit: number;
    };

const parsePriceSearchParam = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : undefined;
};

const normalizeProductPageSize = (pageSize?: number) =>
  typeof pageSize === 'number' && Number.isFinite(pageSize) && pageSize > 0
    ? Math.trunc(pageSize)
    : PRODUCT_PAGE_SIZE;

const normalizeProductPageLimit = (
  limit: number | undefined,
  pageSize: number,
) => {
  const safeLimit =
    typeof limit === 'number' && Number.isFinite(limit) && limit > 0
      ? limit
      : pageSize;

  return Math.max(pageSize, Math.ceil(safeLimit / pageSize) * pageSize);
};

const getProductPageParam = (
  pageParam: ProductPageParam,
  fallbackLimit: number,
) => {
  if (typeof pageParam === 'number') {
    return {
      page: Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1,
      limit: fallbackLimit,
    };
  }

  return {
    page:
      Number.isInteger(pageParam.page) && pageParam.page > 0
        ? pageParam.page
        : 1,
    limit:
      Number.isInteger(pageParam.limit) && pageParam.limit > 0
        ? pageParam.limit
        : fallbackLimit,
  };
};

export const useProduct = ({
  sort = 'relevance',
  category: categoryParam,
  filters: filtersParam,
  colorIds: colorIdsParam,
  minPrice: minPriceParam,
  maxPrice: maxPriceParam,
  discountedOnly: discountedOnlyParam,
  enabled = true,
  initialLimit,
  pageSize: pageSizeParam,
}: UseProductParams = {}) => {
  const routeParams = useParams<{ category?: string }>();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString());
  const shouldFetchAllProducts = categoryParam === null;
  const category = shouldFetchAllProducts
    ? undefined
    : (categoryParam ?? routeParams?.category);

  const rawFiltersFromSearch = params.get('filters');
  const filtersFromSearch =
    rawFiltersFromSearch
      ?.split(',')
      .map((value) => value.trim())
      .filter(Boolean) ?? [];
  const filters = (filtersParam ?? filtersFromSearch).slice().sort();
  const filtersKey = filters.join(',');
  const colorIdsFromSearch =
    params
      .get('colors')
      ?.split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0) ?? [];
  const colorIds = (colorIdsParam ?? colorIdsFromSearch)
    .slice()
    .sort((a, b) => a - b);
  const colorsKey = colorIds.join(',');
  const minPrice =
    minPriceParam ?? parsePriceSearchParam(params.get('minPrice'));
  const maxPrice =
    maxPriceParam ?? parsePriceSearchParam(params.get('maxPrice'));
  const discountedOnly = discountedOnlyParam ?? false;
  const pageSize = normalizeProductPageSize(pageSizeParam);
  const initialPageLimit = normalizeProductPageLimit(initialLimit, pageSize);

  const query = useInfiniteQuery({
    queryKey: productQueryKeys.list({
      category,
      sort,
      pageSize,
      filtersKey,
      colorsKey,
      minPrice,
      maxPrice,
      discountedOnly,
    }),
    initialPageParam: { page: 1, limit: initialPageLimit },
    queryFn: ({ pageParam }) => {
      const { page, limit } = getProductPageParam(pageParam, pageSize);

      return getProductPage(
        category,
        page,
        limit,
        sort,
        filters,
        {
          minPrice,
          maxPrice,
        },
        colorIds,
        discountedOnly,
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.reduce(
        (count, page) => count + page.items.length,
        0,
      );

      if (!lastPage.hasMore || loadedCount >= lastPage.total) {
        return undefined;
      }

      return {
        page: Math.floor(loadedCount / pageSize) + 1,
        limit: pageSize,
      };
    },
    staleTime: PRODUCT_LIST_STALE_TIME_MS,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: enabled && (shouldFetchAllProducts || !!category),
    retry: shouldRetryQuery,
  });

  const products = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? products.length;

  return {
    ...query,
    data: products,
    total,
    pageSize,
  };
};
