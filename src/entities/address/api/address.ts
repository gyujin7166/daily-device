import { fetchApi } from '@shared/api/fetchApi';

import type { UserAddress } from '../model/types';

type UpsertAddressRequest = {
  id?: number;
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
};

type UpsertAddressResponse = {
  id: number;
};

type DeleteAddressRequest = {
  id: number;
};

type DeleteAddressResponse = {
  deletedId: number;
  newDefaultId?: number;
};

export const getUserAddresses = (): Promise<UserAddress[]> =>
  fetchApi('/api/addresses');

export const upsertAddress = (
  data: UpsertAddressRequest,
): Promise<UpsertAddressResponse> =>
  fetchApi('/api/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteAddress = (
  data: DeleteAddressRequest,
): Promise<DeleteAddressResponse> =>
  fetchApi(`/api/addresses/${data.id}`, {
    method: 'DELETE',
  });
