import { createRef } from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductDetailTopSection from './ProductDetailTopSection';

const mocks = vi.hoisted(() => ({
  productDetailRender: vi.fn(),
}));

vi.mock('@shared/ui/Wrapper/PageWrapper', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../detail/ProductDetail', () => ({
  default: () => {
    mocks.productDetailRender();
    return null;
  },
}));

vi.mock('../detail/ProductDetailSkeleton', () => ({ default: () => null }));
vi.mock('./BreadCrumbSkeleton', () => ({ default: () => null }));
vi.mock('./ProductCarouselSkeleton', () => ({ default: () => null }));
vi.mock('./ProductDetailBreadcrumb', () => ({ default: () => null }));
vi.mock('./ProductImageCarousel', () => ({ default: () => null }));

describe('ProductDetailTopSection', () => {
  it('부모가 같은 props로 렌더되어도 상품 상세 영역을 다시 렌더하지 않는다', () => {
    const carouselColumnRef = createRef<HTMLDivElement>();
    const props = {
      detail: 'aster-mouse-mini',
      isDetailInitialLoading: false,
      carouselColumnRef,
      carouselBaseHeight: 500,
    };
    const { rerender } = render(<ProductDetailTopSection {...props} />);

    rerender(<ProductDetailTopSection {...props} />);

    expect(mocks.productDetailRender).toHaveBeenCalledTimes(1);
  });
});
