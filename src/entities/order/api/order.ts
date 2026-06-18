import type {
  CreateOrderRequest,
  OrderResponse,
  OrdersMode,
} from '@entities/order/model/types';

import { fetchApi, fetchApiResponse } from '@shared/api/fetchApi';
import type { ApiResponse } from '@shared/types/api';

import type { OrderStatus } from '@prisma/client';

type OrdersPagedResponse = ApiResponse<
  OrderResponse[],
  {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
>;

type CreateOrderResponse = {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
};

type OrderActionResponse = {
  message?: string;
};

export const getOrders = (): Promise<OrderResponse[]> =>
  fetchApi('/api/orders');

export const getOrdersPaged = ({
  mode,
  page,
  limit,
}: {
  mode: OrdersMode;
  page: number;
  limit: number;
}): Promise<OrdersPagedResponse> => {
  const params = new URLSearchParams({
    mode,
    page: `${page}`,
    limit: `${limit}`,
  });

  return fetchApiResponse(`/api/orders?${params.toString()}`);
};

export const createOrder = (
  data: CreateOrderRequest,
): Promise<CreateOrderResponse> =>
  fetchApi('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const cancelOrder = (
  orderNumber: string,
): Promise<OrderActionResponse> =>
  fetchApi(`/api/orders/${orderNumber}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  });

export const hideOrder = (orderNumber: string): Promise<OrderActionResponse> =>
  fetchApi(`/api/orders/${orderNumber}/hide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  });

export const confirmDelivery = (
  orderNumber: string,
): Promise<OrderActionResponse> =>
  fetchApi(`/api/orders/${orderNumber}/confirm-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber }),
  });
