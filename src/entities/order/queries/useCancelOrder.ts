import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelOrder } from '@entities/order/api/order';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: orderQueryKeys.cancelOrderMutation(),
    mutationFn: cancelOrder,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orderQueryKeys.list(),
      });
    },
  });
};
