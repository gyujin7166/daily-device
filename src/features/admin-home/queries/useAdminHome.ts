import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAdminHomeSections,
  saveAdminHomeSectionItem,
  updateAdminHomeSection,
} from '../api/adminHome';

import type {
  HomeSectionFormState,
  HomeSectionItemFormState,
} from '../model/types';

export const adminHomeQueryKeys = {
  all: ['admin', 'home-sections'] as const,
};

export const useAdminHomeSectionsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: adminHomeQueryKeys.all,
    queryFn: getAdminHomeSections,
    enabled,
  });

export const useUpdateAdminHomeSectionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: HomeSectionFormState) => updateAdminHomeSection(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminHomeQueryKeys.all });
    },
  });
};

export const useSaveAdminHomeSectionItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: HomeSectionItemFormState) =>
      saveAdminHomeSectionItem(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminHomeQueryKeys.all });
    },
  });
};
