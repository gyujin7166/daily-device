import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteAdminProduct,
  getAdminProducts,
  saveAdminProduct,
} from '../api/adminProduct';

import type { AdminProductListParams, ProductFormState } from '../model/types';

export const adminProductQueryKeys = {
  all: ['admin', 'products'] as const,
  list: (params: AdminProductListParams) =>
    [...adminProductQueryKeys.all, params] as const,
};

export const useAdminProductsQuery = (
  params: AdminProductListParams,
  enabled: boolean,
) =>
  useQuery({
    queryKey: adminProductQueryKeys.list(params),
    queryFn: () => getAdminProducts(params),
    enabled,
    placeholderData: keepPreviousData,
  });

export const useSaveAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (form: ProductFormState) => saveAdminProduct(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      });
    },
  });
};

export const useDeleteAdminProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) => deleteAdminProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminProductQueryKeys.all,
      });
    },
  });
};
