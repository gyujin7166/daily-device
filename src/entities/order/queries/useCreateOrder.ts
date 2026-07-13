import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cartQueryKeys } from '@entities/cart/queries/queryKeys';
import { createOrder } from '@entities/order/api/order';
import { orderQueryKeys } from '@entities/order/queries/queryKeys';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: orderQueryKeys.createOrderMutation(),
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.list() });
    },
  });
}
