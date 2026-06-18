import type { CategoryItems } from '@entities/category/model/types';

import { fetchApi } from '@shared/api/fetchApi';

export const getCategory = (): Promise<CategoryItems[]> =>
  fetchApi('/api/products/categories');
