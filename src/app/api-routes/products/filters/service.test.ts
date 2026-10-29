import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getProductCategoryBySlug } from './service';

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('prisma/prismaClientSingleton', () => ({
  default: { productCategory: { findUnique: mocks.findUnique } },
}));

describe('getProductCategoryBySlug', () => {
  beforeEach(() => {
    mocks.findUnique.mockResolvedValue({
      id: 1,
      name_en: 'Mice',
      name_ko: '마우스',
      translations: [
        { locale: 'ko', name: '번역된 마우스' },
        { locale: 'en', name: 'Translated Mice' },
      ],
    });
  });

  it.each([
    { locale: 'ko', name: '번역된 마우스' },
    { locale: 'en', name: 'Translated Mice' },
  ])('$locale 카테고리 번역을 선택한다', async ({ locale, name }) => {
    await expect(getProductCategoryBySlug('mice', locale)).resolves.toEqual({
      id: 1,
      name,
    });
  });

  it('요청 locale 번역이 없으면 한국어 번역으로 fallback한다', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 1,
      name_en: 'Mice',
      translations: [{ locale: 'ko', name: '마우스' }],
    });

    await expect(getProductCategoryBySlug('mice', 'en')).resolves.toEqual({
      id: 1,
      name: '마우스',
    });
  });

  it('번역이 없으면 기존 기본 필드로 fallback한다', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 1,
      name_en: 'Mice',
      translations: [],
    });

    await expect(getProductCategoryBySlug('mice', 'en')).resolves.toEqual({
      id: 1,
      name: 'Mice',
    });
  });

  it('존재하지 않는 카테고리는 null을 반환한다', async () => {
    mocks.findUnique.mockResolvedValue(null);

    await expect(getProductCategoryBySlug('missing', 'en')).resolves.toBeNull();
  });
});
