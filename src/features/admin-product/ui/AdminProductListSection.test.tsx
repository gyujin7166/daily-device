import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import enMessages from '../../../../messages/en.json';
import koMessages from '../../../../messages/ko.json';

import AdminProductListSection from './AdminProductListSection';

import type { AdminProduct } from '../model/types';

const product: AdminProduct = {
  id: 1,
  name_en: 'Aster Mouse Mini',
  name_ko: '아스터 마우스 미니',
  slug: 'aster-mouse-mini',
  search_keyword: 'mouse',
  description: 'A compact mouse.',
  detailed_description: null,
  note: null,
  price: 125_000,
  discountRate: 20,
  productLine: null,
  categoryId: 1,
  createdAt: '2026-07-20T00:00:00.000Z',
  category: {
    id: 1,
    name_en: 'Mice',
    name_ko: '마우스',
    slug: 'mice',
  },
  productColor: [],
  images: [],
  mainImageUrl: '',
  translations: [
    {
      locale: 'en',
      name: 'Aster Mouse Mini',
      description: 'A compact mouse.',
      detailed_description: null,
      note: null,
    },
    {
      locale: 'ko',
      name: '아스터 마우스 미니',
      description: '컴팩트한 마우스입니다.',
      detailed_description: null,
      note: null,
    },
  ],
};

const messagesByLocale = {
  en: {
    Admin: enMessages.Admin,
    AdminProduct: enMessages.AdminProduct,
    Common: enMessages.Common,
  },
  ko: {
    Admin: koMessages.Admin,
    AdminProduct: koMessages.AdminProduct,
    Common: koMessages.Common,
  },
};

describe('AdminProductListSection', () => {
  it.each([
    { locale: 'ko' as const, expectedPrice: '100,000원' },
    { locale: 'en' as const, expectedPrice: '₩100,000' },
  ])(
    '$locale locale의 통화 형식으로 가격을 표시한다',
    ({ locale, expectedPrice }) => {
      render(
        <NextIntlClientProvider
          locale={locale}
          messages={messagesByLocale[locale]}
        >
          <AdminProductListSection
            params={{ page: 1, limit: 20, keyword: '', categoryId: '' }}
            products={[product]}
            categories={[]}
            selectedProductId={null}
            isFetching={false}
            isSaving={false}
            onKeywordChange={vi.fn()}
            onCategoryChange={vi.fn()}
            onPageChange={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        </NextIntlClientProvider>,
      );

      expect(screen.getByText(expectedPrice)).toBeInTheDocument();
    },
  );
});
