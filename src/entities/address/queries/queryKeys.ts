export const addressQueryKeys = {
  all: ['address'] as const,
  userAddresses: () => [...addressQueryKeys.all, 'userAddresses'] as const,
  suspenseUserAddresses: () =>
    [...addressQueryKeys.userAddresses(), 'suspense'] as const,
};

export const addressMutationKeys = {
  all: ['address-mutation'] as const,
  upsertAddress: () => [...addressMutationKeys.all, 'upsert-address'] as const,
  deleteAddress: () => [...addressMutationKeys.all, 'delete-address'] as const,
};
