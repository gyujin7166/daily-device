export const addressQueryKeys = {
  all: ['address'] as const,
  userAddresses: () => [...addressQueryKeys.all, 'userAddresses'] as const,
  suspenseUserAddresses: (status: string, enabled: boolean) =>
    [...addressQueryKeys.userAddresses(), 'suspense', status, enabled] as const,
};

export const addressMutationKeys = {
  all: ['address-mutation'] as const,
  upsertAddress: () => [...addressMutationKeys.all, 'upsert-address'] as const,
  deleteAddress: () => [...addressMutationKeys.all, 'delete-address'] as const,
};
