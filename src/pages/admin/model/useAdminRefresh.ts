import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { adminHeroQueryKeys } from '@features/admin-hero/queries/useAdminHero';
import { adminHomeQueryKeys } from '@features/admin-home/queries/useAdminHome';
import { adminProductQueryKeys } from '@features/admin-product/queries/useAdminProduct';
import { adminReviewQueryKeys } from '@features/admin-review/queries/useAdminReview';

import type { AdminTab } from './types';

export const useAdminRefresh = (activeTab: AdminTab) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (activeTab === 'heroes') {
      void queryClient.invalidateQueries({ queryKey: adminHeroQueryKeys.all });
      return;
    }

    if (activeTab === 'home') {
      void queryClient.invalidateQueries({ queryKey: adminHomeQueryKeys.all });
      return;
    }

    if (activeTab === 'products') {
      void queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      });
      return;
    }

    void queryClient.invalidateQueries({ queryKey: adminReviewQueryKeys.all });
  }, [activeTab, queryClient]);
};
