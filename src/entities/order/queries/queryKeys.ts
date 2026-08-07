import type { OrdersMode } from '@entities/order/model/types';

export const orderQueryKeys = {
  all: ['orders'] as const,
  list: () => [...orderQueryKeys.all, 'list'] as const,
  suspenseList: (status: string, enabled: boolean) =>
    [...orderQueryKeys.list(), 'suspense', status, enabled] as const,
  paged: (mode: OrdersMode, page: number, limit: number) =>
    [...orderQueryKeys.list(), 'paged', mode, page, limit] as const,
  suspensePaged: (mode: OrdersMode, page: number, limit: number) =>
    [...orderQueryKeys.list(), 'suspensePaged', mode, page, limit] as const,
  createOrderMutation: () =>
    [...orderQueryKeys.all, 'createOrderMutation'] as const,
  cancelOrderMutation: () =>
    [...orderQueryKeys.all, 'cancelOrderMutation'] as const,
  confirmDeliveryMutation: () =>
    [...orderQueryKeys.all, 'confirmDeliveryMutation'] as const,
  hideOrderMutation: () =>
    [...orderQueryKeys.all, 'hideOrderMutation'] as const,
};
