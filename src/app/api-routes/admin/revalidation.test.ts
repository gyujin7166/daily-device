import { revalidatePath } from 'next/cache';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DELETE as deleteHero,
  PUT as updateHero,
} from './heroes/[heroId]/route';
import { POST as createHero } from './heroes/route';
import { PUT as updateHomeSectionItem } from './home-section-items/[itemId]/route';
import { POST as createHomeSectionItem } from './home-section-items/route';
import { PUT as updateHomeSection } from './home-sections/[sectionId]/route';
import {
  DELETE as deleteProduct,
  PUT as updateProduct,
} from './products/[productId]/route';
import { POST as createProduct } from './products/route';
import { PATCH as updateReviewVisibility } from './reviews/[reviewId]/route';
import { createAdminProduct } from './service';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('server-only', () => ({}));

vi.mock('@shared/lib/api/handleRouteError', () => ({
  handleRouteError: vi.fn(() => new Response(null, { status: 500 })),
}));

vi.mock('@shared/lib/api/parseWithSchema', () => ({
  parseWithSchema: vi.fn((_schema, input) => input),
}));

vi.mock('@shared/lib/api/readJsonBody', () => ({
  readJsonBody: vi.fn().mockResolvedValue({ hidden: true }),
}));

vi.mock('./service', () => ({
  assertAdminWriteAccess: vi.fn().mockResolvedValue(undefined),
  createAdminHero: vi.fn().mockResolvedValue({ id: 1 }),
  createAdminHomeSectionItem: vi.fn().mockResolvedValue({ id: 1 }),
  createAdminProduct: vi.fn().mockResolvedValue({ id: 1 }),
  deleteAdminHero: vi.fn().mockResolvedValue(undefined),
  deleteAdminProduct: vi.fn().mockResolvedValue(undefined),
  hideAdminReview: vi.fn().mockResolvedValue({ id: 1 }),
  restoreAdminReview: vi.fn().mockResolvedValue({ id: 1 }),
  updateAdminHero: vi.fn().mockResolvedValue({ id: 1 }),
  updateAdminHomeSection: vi.fn().mockResolvedValue({ id: 1 }),
  updateAdminHomeSectionItem: vi.fn().mockResolvedValue({ id: 1 }),
  updateAdminProduct: vi.fn().mockResolvedValue({ id: 1 }),
}));

const request = {} as Request;
const context = <T extends string>(param: T) => ({
  params: Promise.resolve({ [param]: '1' } as Record<T, string>),
});

describe('관리자 공개 페이지 캐시 무효화', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['상품 생성', () => createProduct(request)],
    ['상품 수정', () => updateProduct(request, context('productId'))],
    ['상품 삭제', () => deleteProduct(request, context('productId'))],
    ['히어로 생성', () => createHero(request)],
    ['히어로 수정', () => updateHero(request, context('heroId'))],
    ['히어로 삭제', () => deleteHero(request, context('heroId'))],
    ['홈 섹션 수정', () => updateHomeSection(request, context('sectionId'))],
    ['홈 섹션 아이템 생성', () => createHomeSectionItem(request)],
    [
      '홈 섹션 아이템 수정',
      () => updateHomeSectionItem(request, context('itemId')),
    ],
    [
      '리뷰 공개 상태 수정',
      () => updateReviewVisibility(request, context('reviewId')),
    ],
  ])('%s 성공 후 쇼핑 레이아웃을 갱신한다', async (_label, mutate) => {
    await mutate();

    expect(revalidatePath).toHaveBeenCalledOnce();
    expect(revalidatePath).toHaveBeenCalledWith('/[locale]/(shop)', 'layout');
  });

  it('변경이 실패하면 쇼핑 레이아웃을 갱신하지 않는다', async () => {
    vi.mocked(createAdminProduct).mockRejectedValueOnce(
      new Error('mutation failed'),
    );

    await createProduct(request);

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
