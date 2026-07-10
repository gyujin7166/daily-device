import type { CategoryItems } from '@entities/category/model/types';

import { fetchApi } from '@shared/api/fetchApi';

export const getCategory = (locale?: string): Promise<CategoryItems[]> => {
  const params = new URLSearchParams();

  if (locale) {
    params.set('locale', locale);
  }

  const queryString = params.toString();

  return fetchApi(
    `/api/products/categories${queryString ? `?${queryString}` : ''}`,
  );
};
