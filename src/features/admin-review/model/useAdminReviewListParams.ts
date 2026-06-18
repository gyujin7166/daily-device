import { useCallback, useState } from 'react';

import type { AdminReviewListParams, AdminReviewStatus } from './types';

const PAGE_LIMIT = 10;

const initialReviewParams: AdminReviewListParams = {
  page: 1,
  limit: PAGE_LIMIT,
  keyword: '',
  status: 'all',
};

export const useAdminReviewListParams = () => {
  const [params, setParams] =
    useState<AdminReviewListParams>(initialReviewParams);

  const updateKeyword = useCallback((keyword: string) => {
    setParams((prev) => ({ ...prev, keyword, page: 1 }));
  }, []);

  const updateStatus = useCallback((status: AdminReviewStatus) => {
    setParams((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const updatePage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  return {
    params,
    updateKeyword,
    updateStatus,
    updatePage,
  };
};
