import { useMutation, useQueryClient } from '@tanstack/react-query';

import { upsertAddress } from '@entities/address/api/address';
import type { UserAddress } from '@entities/address/model/types';
import {
  addressMutationKeys,
  addressQueryKeys,
} from '@entities/address/queries/queryKeys';

export const useUpsertAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: addressMutationKeys.upsertAddress(),
    mutationFn: upsertAddress,
    onSuccess: async (result, variables) => {
      const upsertedId = result?.id ?? variables.id;
      if (upsertedId !== undefined) {
        queryClient.setQueryData<UserAddress[]>(
          addressQueryKeys.userAddresses(),
          (prev = []) => {
            const nextItem: UserAddress = {
              id: upsertedId,
              recipientName: variables.recipientName,
              recipientPhone: variables.recipientPhone,
              address1: variables.address1,
              address2: variables.address2 ?? null,
              isDefault: Boolean(variables.isDefault),
              updatedAt: new Date().toISOString(),
            };

            const exists = prev.some((item) => item.id === upsertedId);
            let next = exists
              ? prev.map((item) => (item.id === upsertedId ? nextItem : item))
              : [nextItem, ...prev];

            if (nextItem.isDefault) {
              next = next.map((item) => ({
                ...item,
                isDefault: item.id === upsertedId,
              }));
            }

            return next.sort((a, b) =>
              a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1,
            );
          },
        );
      }

      await queryClient.invalidateQueries({
        queryKey: addressQueryKeys.userAddresses(),
      });
    },
  });
};
