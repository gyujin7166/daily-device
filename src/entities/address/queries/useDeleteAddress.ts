import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAddress } from '@entities/address/api/address';
import {
  addressMutationKeys,
  addressQueryKeys,
} from '@entities/address/queries/queryKeys';

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: addressMutationKeys.deleteAddress(),
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: addressQueryKeys.userAddresses(),
      });
    },
  });
};
