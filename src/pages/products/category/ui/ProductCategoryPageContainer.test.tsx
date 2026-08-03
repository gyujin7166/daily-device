import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductCategoryPageContainer from './ProductCategoryPageContainer';

const mocks = vi.hoisted(() => ({
  pendingContent: new Promise<never>(() => {}),
}));

vi.mock('./ProductCategoryHeroContainer', () => ({
  default: () => <div data-testid="product-hero">product-hero</div>,
}));

vi.mock('./ProductCategoryLoadingState', () => ({
  default: () => <div>product-list-loading</div>,
}));

vi.mock('./ProductCategoryContentContainer', () => ({
  default: () => {
    throw mocks.pendingContent;
  },
}));

describe('ProductCategoryPageContainer', () => {
  it('상품 콘텐츠가 대기 중이어도 Hero를 한 번만 렌더한다', () => {
    render(
      <ProductCategoryPageContainer
        category="keyboards"
        priceRange={{ minPrice: 0, maxPrice: 100_000 }}
        colorOptions={[]}
      />,
    );

    expect(screen.getAllByTestId('product-hero')).toHaveLength(1);
    expect(screen.getByText('product-list-loading')).toBeVisible();
  });
});
