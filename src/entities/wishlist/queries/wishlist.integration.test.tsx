import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import type { WishlistItem } from '@entities/wishlist/model/types';

import { HttpError } from '@shared/lib/errors/httpError';

import {
  TEST_API_URL,
  wishlistItemFixture,
} from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import {
  createQueryWrapper,
  createTestQueryClient,
} from '../../../../test/render';

import { wishlistQueryKeys } from './queryKeys';
import { useClearWishlist } from './useClearWishlist';
import { useDeleteWishlist } from './useDeleteWishlist';
import { useUpsertWishlist } from './useUpsertWishlist';
import { useWishlist } from './useWishlist';

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user' } },
    status: 'authenticated',
  }),
}));

const secondWishlistItem: WishlistItem = {
  ...wishlistItemFixture,
  id: 2,
  alt: 'KEYBOARD',
  name: 'KEYBOARD',
  href: '/products/keyboards/keyboard',
};

const TEST_LOCALE = 'ko';

const renderWishlistHook = <T,>(hook: () => T) => {
  const queryClient = createTestQueryClient();
  const result = renderHook(hook, {
    wrapper: createQueryWrapper(queryClient),
  });

  return { ...result, queryClient };
};

const setWishlistItems = (
  queryClient: ReturnType<typeof createTestQueryClient>,
  items: WishlistItem[],
) => {
  queryClient.setQueryData(wishlistQueryKeys.list(TEST_LOCALE), items);
};

describe('useWishlist', () => {
  it('찜 목록을 조회한다', async () => {
    const { result } = renderWishlistHook(useWishlist);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([wishlistItemFixture]);
  });

  it('빈 찜 목록을 정상 상태로 처리한다', async () => {
    server.use(
      http.get(`${TEST_API_URL}/api/wishlist`, () =>
        HttpResponse.json({ items: [], message: 'Success' }),
      ),
    );

    const { result } = renderWishlistHook(useWishlist);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('인증 오류는 재시도하지 않는다', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${TEST_API_URL}/api/wishlist`, () => {
        requestCount += 1;
        return HttpResponse.json(
          { items: [], message: '로그인이 필요합니다.' },
          { status: 401 },
        );
      }),
    );

    const { result } = renderWishlistHook(useWishlist);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(HttpError);
    expect(result.current.error).toMatchObject({
      status: 401,
      message: '로그인이 필요합니다.',
    });
    expect(requestCount).toBe(1);
  });

  it('서버 오류는 두 번 재시도한 뒤 실패한다', async () => {
    let requestCount = 0;
    server.use(
      http.get(`${TEST_API_URL}/api/wishlist`, () => {
        requestCount += 1;
        return HttpResponse.json(
          { items: [], message: '서버 오류' },
          { status: 500 },
        );
      }),
    );

    const { result } = renderWishlistHook(useWishlist);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toMatchObject({
      status: 500,
      message: '서버 오류',
    });
    expect(requestCount).toBe(3);
  });
});

describe('wishlist mutations', () => {
  it('찜 상품을 추가하고 요청 payload를 전달한다', async () => {
    let receivedProductId: number | undefined;
    server.use(
      http.post(`${TEST_API_URL}/api/wishlist`, async ({ request }) => {
        const body = (await request.json()) as { productId: number };
        receivedProductId = body.productId;
        return HttpResponse.json({
          items: { productId: body.productId, isWishlisted: true },
          message: 'Success',
        });
      }),
    );

    const { result, queryClient } = renderWishlistHook(useUpsertWishlist);
    setWishlistItems(queryClient, [wishlistItemFixture]);

    await act(async () => {
      await result.current.mutateAsync(secondWishlistItem);
    });

    expect(receivedProductId).toBe(secondWishlistItem.id);
    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual([
      secondWishlistItem,
      wishlistItemFixture,
    ]);
  });

  it('찜 추가 실패 시 이전 목록으로 되돌린다', async () => {
    server.use(
      http.post(`${TEST_API_URL}/api/wishlist`, () =>
        HttpResponse.json({ message: '추가 실패' }, { status: 500 }),
      ),
    );

    const { result, queryClient } = renderWishlistHook(useUpsertWishlist);
    setWishlistItems(queryClient, [wishlistItemFixture]);

    await act(async () => {
      await expect(
        result.current.mutateAsync(secondWishlistItem),
      ).rejects.toThrow('추가 실패');
    });

    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual([
      wishlistItemFixture,
    ]);
  });

  it('찜 상품을 삭제한다', async () => {
    const { result, queryClient } = renderWishlistHook(useDeleteWishlist);
    setWishlistItems(queryClient, [wishlistItemFixture, secondWishlistItem]);

    await act(async () => {
      await result.current.mutateAsync(secondWishlistItem.id);
    });

    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual([
      wishlistItemFixture,
    ]);
  });

  it('찜 삭제 실패 시 이전 목록으로 되돌린다', async () => {
    server.use(
      http.delete(`${TEST_API_URL}/api/wishlist/:productId`, () =>
        HttpResponse.json({ message: '삭제 실패' }, { status: 500 }),
      ),
    );

    const previousItems = [wishlistItemFixture, secondWishlistItem];
    const { result, queryClient } = renderWishlistHook(useDeleteWishlist);
    setWishlistItems(queryClient, previousItems);

    await act(async () => {
      await expect(
        result.current.mutateAsync(secondWishlistItem.id),
      ).rejects.toThrow('삭제 실패');
    });

    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual(
      previousItems,
    );
  });

  it('찜 목록을 전체 삭제한다', async () => {
    const { result, queryClient } = renderWishlistHook(useClearWishlist);
    setWishlistItems(queryClient, [wishlistItemFixture, secondWishlistItem]);

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual([]);
  });

  it('전체 삭제 실패 시 이전 목록으로 되돌린다', async () => {
    server.use(
      http.delete(`${TEST_API_URL}/api/wishlist`, () =>
        HttpResponse.json({ message: '전체 삭제 실패' }, { status: 500 }),
      ),
    );

    const previousItems = [wishlistItemFixture, secondWishlistItem];
    const { result, queryClient } = renderWishlistHook(useClearWishlist);
    setWishlistItems(queryClient, previousItems);

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toThrow(
        '전체 삭제 실패',
      );
    });

    expect(queryClient.getQueryData(wishlistQueryKeys.list(TEST_LOCALE))).toEqual(
      previousItems,
    );
  });
});
