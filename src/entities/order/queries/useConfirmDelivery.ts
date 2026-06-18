import { useMutation, useQueryClient } from '@tanstack/react-query';

import { confirmDelivery } from '@entities/order/api/order';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

export const useConfirmDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: orderQueryKeys.confirmDeliveryMutation(),
    mutationFn: confirmDelivery,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: orderQueryKeys.list(),
      });
    },
  });
};
