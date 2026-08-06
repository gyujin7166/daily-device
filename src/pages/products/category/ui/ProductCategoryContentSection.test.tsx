import type { PropsWithChildren } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductCategoryContentSection from './ProductCategoryContentSection';

vi.mock('@shared/ui/Wrapper/PageWrapper', () => ({
  default: ({ children }: PropsWithChildren) => <>{children}</>,
}));

describe('ProductCategoryContentSection', () => {
  it('필터와 상품 결과를 각각의 렌더 경계로 조합한다', () => {
    render(
      <ProductCategoryContentSection
        sidebar={<aside>product-filter</aside>}
        filterBar={<div>product-filter-bar</div>}
        productResults={<div>product-results</div>}
      />,
    );

    expect(screen.getByText('product-filter')).toBeVisible();
    expect(screen.getByText('product-filter-bar')).toBeVisible();
    expect(screen.getByText('product-results')).toBeVisible();
  });
});
