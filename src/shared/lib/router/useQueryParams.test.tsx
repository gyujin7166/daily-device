import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useQueryParams } from './useQueryParams';

const mocks = vi.hoisted(() => {
  const push = vi.fn();
  const replace = vi.fn();

  return {
    router: { push, replace },
    searchParams: new URLSearchParams(),
  };
});

vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  usePathname: () => '/products/mice',
  useRouter: () => mocks.router,
}));

describe('useQueryParams', () => {
  beforeEach(() => {
    mocks.searchParams = new URLSearchParams('filters=daily-line');
    window.history.replaceState(null, '', '/products/mice?filters=daily-line');
  });

  it('검색 파라미터가 바뀌어도 setter 참조를 유지하고 최신 값을 사용한다', () => {
    const { result, rerender } = renderHook(() => useQueryParams());
    const initialSetParam = result.current.setParam;

    mocks.searchParams = new URLSearchParams(
      'filters=daily-line&minPrice=10000',
    );
    rerender();

    expect(result.current.setParam).toBe(initialSetParam);

    act(() => result.current.setParam('colors', '2'));

    expect(window.location.search).toBe(
      '?filters=daily-line&minPrice=10000&colors=2',
    );
  });
});
