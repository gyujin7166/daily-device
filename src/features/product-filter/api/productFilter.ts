import type { FilterWithOptions } from '@entities/product/model/types';

import { fetchApi } from '@shared/api/fetchApi';

export const getProductFilter = (
  category: string,
): Promise<FilterWithOptions[]> => {
  const params = new URLSearchParams({ category });
  return fetchApi(`/api/products/filters?${params.toString()}`);
};
