import { describe, expect, it } from 'vitest';

import { getMyTabFromPathname } from './myPageMenu';

describe('getMyTabFromPathname', () => {
  it.each([
    ['/my', 'overview'],
    ['/my/orders', 'orders'],
    ['/my/orders/ORDER-001', 'orders'],
    ['/my/wishlist', 'wishlist'],
    ['/my/address', 'address'],
    ['/my/reviews', 'reviews'],
    ['/my/reviews/write', 'write-review'],
    ['/my/reviews/write/ORDER-001', 'write-review'],
  ] as const)('%s 경로를 %s 탭으로 변환한다', (pathname, expected) => {
    expect(getMyTabFromPathname(pathname)).toBe(expected);
  });
});
