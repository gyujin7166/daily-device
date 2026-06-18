import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

import { getUserAddresses } from '@entities/address/api/address';
import { addressQueryKeys } from '@entities/address/queries/queryKeys';

import { shouldRetryQuery } from '@shared/lib/query/shouldRetryQuery';

type UseUserAddressesOptions = {
  enabled?: boolean;
};

export const useUserAddresses = ({
  enabled = true,
}: UseUserAddressesOptions = {}) => {
  const { data: session } = useSession();

  return useQuery({
    queryKey: addressQueryKeys.userAddresses(),
    queryFn: getUserAddresses,
    enabled: enabled && !!session?.user,
    staleTime: 60 * 1000,
    retry: shouldRetryQuery,
  });
};

export const useSuspenseUserAddresses = ({
  enabled = true,
}: UseUserAddressesOptions = {}) => {
  const { status } = useSession();

  return useSuspenseQuery({
    queryKey: addressQueryKeys.suspenseUserAddresses(status, enabled),
    queryFn: getUserAddresses,
    staleTime: 60 * 1000,
    retry: shouldRetryQuery,
  });
};
