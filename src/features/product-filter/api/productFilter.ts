import type { FilterWithOptions } from '@entities/product/model/types';

import { fetchApi } from '@shared/api/fetchApi';

export const getProductFilter = (
  category: string,
  locale?: string,
): Promise<FilterWithOptions[]> => {
  const params = new URLSearchParams({ category });

  if (locale) {
    params.set('locale', locale);
  }

  return fetchApi(`/api/products/filters?${params.toString()}`);
};
