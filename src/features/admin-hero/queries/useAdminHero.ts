import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productQueryKeys } from '@entities/product/queries/queryKeys';

import {
  deleteAdminHero,
  getAdminHeroes,
  saveAdminHero,
} from '../api/adminHero';

import type { HeroFormState } from '../model/types';

export const adminHeroQueryKeys = {
  all: ['admin', 'heroes'] as const,
};

export const useAdminHeroesQuery = (enabled: boolean) =>
  useQuery({
    queryKey: adminHeroQueryKeys.all,
    queryFn: getAdminHeroes,
    enabled,
  });

export const useSaveAdminHeroMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: HeroFormState) => saveAdminHero(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminHeroQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.heroes(),
      });
    },
  });
};

export const useDeleteAdminHeroMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (heroId: number) => deleteAdminHero(heroId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminHeroQueryKeys.all });
      void queryClient.invalidateQueries({
        queryKey: productQueryKeys.heroes(),
      });
    },
  });
};
