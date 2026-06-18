import type { HomeSection } from '@entities/home/model/types';

import { fetchApi } from '@shared/api/fetchApi';

export const getHomeSections = (
  keys: string[] = [],
): Promise<HomeSection[]> => {
  const params = new URLSearchParams();
  if (keys.length > 0) {
    params.set('keys', keys.join(','));
  }

  const queryString = params.toString();

  return fetchApi(`/api/home/sections${queryString ? `?${queryString}` : ''}`);
};
