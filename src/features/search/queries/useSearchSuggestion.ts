import { useEffect, useState } from 'react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

import { getSearchSuggestions } from '../api/search';

import { searchQueryKeys } from './queryKeys';

export const useSearchSuggestion = (keyword: string) => {
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [isDebouncing, setIsDebouncing] = useState(false);
  useEffect(() => {
    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setIsDebouncing(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [keyword]);

  const result = useQuery({
    queryKey: searchQueryKeys.suggestions(debouncedKeyword),
    queryFn: () => getSearchSuggestions(debouncedKeyword),
    enabled: !!debouncedKeyword && debouncedKeyword.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: shouldRetryQuery,
  });

  return {
    ...result,
    isDebouncing,
    debouncedKeyword,
  };
};
