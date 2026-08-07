import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import useProductDetailPageState from './useProductDetailPageState';

describe('useProductDetailPageState', () => {
  it('상품평 상태가 바뀌어도 최근 본 상품 배열 참조를 유지한다', () => {
    const { result } = renderHook(() =>
      useProductDetailPageState({
        product: null,
        currentPath: '/products/mice/aster-mouse-mini',
      }),
    );
    const initialRecentlyViewed = result.current.visibleRecentlyViewed;

    act(() => {
      result.current.handleReviewSortChange('rating_desc');
    });

    expect(result.current.visibleRecentlyViewed).toBe(initialRecentlyViewed);
  });
});
