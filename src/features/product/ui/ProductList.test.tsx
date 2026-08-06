import type { ReactNode } from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CatalogProductItem } from '@entities/product/model/types';

import ProductList from './ProductList';

const mocks = vi.hoisted(() => ({
  productItemRender: vi.fn(),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@entities/product/ui', () => ({
  ProductCard: ({ children }: { children: ReactNode }) => children,
  ProductSkeleton: () => null,
}));

vi.mock('./ProductItem', () => ({
  default: () => {
    mocks.productItemRender();
    return <article>상품</article>;
  },
}));

const product = { id: 101 } as CatalogProductItem;
let animationFrameCallbacks: FrameRequestCallback[] = [];

const flushAnimationFrames = () => {
  const callbacks = animationFrameCallbacks;
  animationFrameCallbacks = [];
  callbacks.forEach((callback) => callback(0));
};

describe('ProductList', () => {
  beforeEach(() => {
    animationFrameCallbacks = [];
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
      writable: true,
    });
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        animationFrameCallbacks.push(callback);
        return animationFrameCallbacks.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('맨 위로 버튼 표시 상태가 바뀌어도 상품 행을 다시 렌더하지 않는다', () => {
    render(<ProductList products={[product]} isPending={false} />);

    expect(mocks.productItemRender).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'backToTop' })).toHaveClass(
      'opacity-0',
    );

    window.scrollY = 750;
    act(() => {
      fireEvent.scroll(window);
      flushAnimationFrames();
    });

    expect(screen.getByRole('button', { name: 'backToTop' })).toHaveClass(
      'opacity-100',
    );
    expect(mocks.productItemRender).toHaveBeenCalledTimes(1);
  });

  it('상품 목록의 표시 상태만 바뀌면 기존 상품 행을 다시 렌더하지 않는다', () => {
    const products = [product];
    const { rerender } = render(
      <ProductList products={products} isPending={false} />,
    );

    expect(mocks.productItemRender).toHaveBeenCalledTimes(1);

    rerender(
      <ProductList products={products} isPending={false} isRefreshing />,
    );

    expect(mocks.productItemRender).toHaveBeenCalledTimes(1);
  });
});
