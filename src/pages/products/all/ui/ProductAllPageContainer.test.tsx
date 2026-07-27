import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ProductAllPageContainer from './ProductAllPageContainer';

const mocks = vi.hoisted(() => ({
  pendingContent: new Promise<never>(() => {}),
}));

vi.mock('./ProductAllHeroContainer', () => ({
  default: () => <div data-testid="product-hero">product-hero</div>,
}));

vi.mock('./ProductAllLoadingState', () => ({
  default: () => <div>product-list-loading</div>,
}));

vi.mock('./ProductAllContentContainer', () => ({
  default: () => {
    throw mocks.pendingContent;
  },
}));

describe('ProductAllPageContainer', () => {
  it('상품 콘텐츠가 대기 중이어도 Hero를 한 번만 렌더한다', () => {
    render(<ProductAllPageContainer />);

    expect(screen.getAllByTestId('product-hero')).toHaveLength(1);
    expect(screen.getByText('product-list-loading')).toBeVisible();
  });
});
