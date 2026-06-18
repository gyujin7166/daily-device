import { useMutation, useQueryClient } from '@tanstack/react-query';

import { hideOrder } from '@entities/order/api/order';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

export const useHideOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: orderQueryKeys.hideOrderMutation(),
    mutationFn: hideOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orderQueryKeys.list(),
      });
    },
  });
};
