import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '@shared/lib/errors/httpError';

import { orderFixture, TEST_API_URL } from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import {
  createQueryWrapper,
  createTestQueryClient,
} from '../../../../test/render';

import { orderQueryKeys } from './queryKeys';
import { useCancelOrder } from './useCancelOrder';
import { useConfirmDelivery } from './useConfirmDelivery';
import { useHideOrder } from './useHideOrder';
import { useOrders } from './useOrders';
import { useOrdersPaged } from './useOrdersPaged';

const mocks = vi.hoisted(() => ({
  sessionStatus: 'authenticated',
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data:
      mocks.sessionStatus === 'authenticated'
        ? { user: { id: 'test-user' } }
        : null,
    status: mocks.sessionStatus,
  }),
}));

const renderOrderHook = <T,>(hook: () => T) => {
  const queryClient = createTestQueryClient();
  const result = renderHook(hook, {
    wrapper: createQueryWrapper(queryClient),
  });

  return { ...result, queryClient };
};

describe('order queries', () => {
  beforeEach(() => {
    mocks.sessionStatus = 'authenticated';
  });

  it('주문 목록을 조회한다', async () => {
    const { result } = renderOrderHook(useOrders);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([orderFixture]);
  });

  it('mode와 페이지 정보를 전달해 주문 목록을 조회한다', async () => {
    let receivedParams: URLSearchParams | undefined;
    server.use(
      http.get(`${TEST_API_URL}/api/orders`, ({ request }) => {
        receivedParams = new URL(request.url).searchParams;
        return HttpResponse.json({
          items: [orderFixture],
          total: 3,
          page: 2,
          limit: 2,
          totalPages: 2,
          message: 'Success',
        });
      }),
    );

    const { result } = renderOrderHook(() =>
      useOrdersPaged({ mode: 'review', page: 2, limit: 2 }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(Object.fromEntries(receivedParams ?? [])).toEqual({
      mode: 'review',
      page: '2',
      limit: '2',
    });
    expect(result.current.data).toEqual({
      items: [orderFixture],
      total: 3,
      page: 2,
      limit: 2,
      totalPages: 2,
      message: 'Success',
    });
  });

  it('빈 페이지 응답을 정상 상태로 처리한다', async () => {
    server.use(
      http.get(`${TEST_API_URL}/api/orders`, () =>
        HttpResponse.json({
          items: [],
          total: 0,
          page: 1,
          limit: 2,
          totalPages: 1,
          message: 'Success',
        }),
      ),
    );

    const { result } = renderOrderHook(useOrdersPaged);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.items).toEqual([]);
    expect(result.current.data?.total).toBe(0);
  });

  it('인증 오류는 재시도하지 않는다', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${TEST_API_URL}/api/orders`, () => {
        requestCount += 1;
        return HttpResponse.json(
          { items: [], message: '로그인이 필요합니다.' },
          { status: 401 },
        );
      }),
    );

    const { result } = renderOrderHook(useOrders);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(HttpError);
    expect(result.current.error).toMatchObject({ status: 401 });
    expect(requestCount).toBe(1);
  });

  it('비로그인 상태에서는 주문 요청을 보내지 않는다', () => {
    mocks.sessionStatus = 'unauthenticated';

    const { result } = renderOrderHook(useOrders);

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});

const mutationCases = [
  {
    label: '주문 취소',
    action: 'cancel',
    useMutation: useCancelOrder,
  },
  {
    label: '배송 확정',
    action: 'confirm-delivery',
    useMutation: useConfirmDelivery,
  },
  {
    label: '주문 숨기기',
    action: 'hide',
    useMutation: useHideOrder,
  },
] as const;

describe('order mutations', () => {
  it.each(mutationCases)(
    '$label 성공 시 주문 목록 캐시를 무효화한다',
    async ({ action, useMutation }) => {
      let receivedOrderNumber: string | undefined;
      let receivedBody: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${TEST_API_URL}/api/orders/:orderNumber/${action}`,
          async ({ params, request }) => {
            receivedOrderNumber = String(params.orderNumber);
            receivedBody = (await request.json()) as Record<string, unknown>;
            return HttpResponse.json({ message: 'Success' });
          },
        ),
      );

      const { result, queryClient } = renderOrderHook(useMutation);
      const pagedKey = orderQueryKeys.paged('all', 1, 2);
      queryClient.setQueryData(orderQueryKeys.list(), [orderFixture]);
      queryClient.setQueryData(pagedKey, { items: [orderFixture] });

      await act(async () => {
        await result.current.mutateAsync(orderFixture.orderNumber);
      });

      expect(receivedOrderNumber).toBe(orderFixture.orderNumber);
      expect(receivedBody).toEqual({
        orderNumber: orderFixture.orderNumber,
      });
      expect(
        queryClient.getQueryState(orderQueryKeys.list())?.isInvalidated,
      ).toBe(true);
      expect(queryClient.getQueryState(pagedKey)?.isInvalidated).toBe(true);
    },
  );

  it.each(mutationCases)(
    '$label 실패 시 오류를 반환하고 캐시를 유지한다',
    async ({ action, useMutation }) => {
      server.use(
        http.post(`${TEST_API_URL}/api/orders/:orderNumber/${action}`, () =>
          HttpResponse.json({ message: `${action} 실패` }, { status: 409 }),
        ),
      );

      const { result, queryClient } = renderOrderHook(useMutation);
      queryClient.setQueryData(orderQueryKeys.list(), [orderFixture]);

      await act(async () => {
        await expect(
          result.current.mutateAsync(orderFixture.orderNumber),
        ).rejects.toThrow(`${action} 실패`);
      });

      expect(
        queryClient.getQueryState(orderQueryKeys.list())?.isInvalidated,
      ).toBe(false);
      expect(queryClient.getQueryData(orderQueryKeys.list())).toEqual([
        orderFixture,
      ]);
    },
  );
});
