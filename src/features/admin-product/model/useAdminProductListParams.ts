import { useCallback, useState } from 'react';

import type { AdminProductListParams } from './types';

const PAGE_LIMIT = 10;

export const useAdminProductListParams = () => {
  const [params, setParams] = useState<AdminProductListParams>({
    page: 1,
    limit: PAGE_LIMIT,
    keyword: '',
    categoryId: '',
  });

  const updateKeyword = useCallback((keyword: string) => {
    setParams((prev) => ({ ...prev, keyword, page: 1 }));
  }, []);

  const updateCategory = useCallback((categoryId: string) => {
    setParams((prev) => ({ ...prev, categoryId, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  return {
    params,
    updateKeyword,
    updateCategory,
    updatePage,
  };
};
