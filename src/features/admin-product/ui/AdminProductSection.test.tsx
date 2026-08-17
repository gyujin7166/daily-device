import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminProductSection from './AdminProductSection';

import type { AdminProduct, AdminProductPayload } from '../model/types';

const mocks = vi.hoisted(() => ({
  renderProductList: vi.fn(),
  saveProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

const data: AdminProductPayload = {
  categories: [
    {
      id: 1,
      name_en: 'Mice',
      name_ko: '마우스',
      slug: 'mice',
    },
  ],
  colors: [
    {
      id: 2,
      name: 'Black',
      hex: '#000000',
      translations: [
        { locale: 'ko', name: '검정' },
        { locale: 'en', name: 'Black' },
      ],
    },
  ],
  products: {
    items: [
      {
        id: 10,
        name_en: 'Aster Mouse',
        name_ko: '아스터 마우스',
        slug: 'aster-mouse',
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
            locale: 'ko',
            name: '아스터 마우스',
            description: '컴팩트한 마우스입니다.',
            detailed_description: null,
            note: null,
          },
          {
            locale: 'en',
            name: 'Aster Mouse',
            description: 'A compact mouse.',
            detailed_description: null,
            note: null,
          },
        ],
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  },
};

vi.mock('next-intl', () => ({
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => key,
}));

vi.mock('../queries/useAdminProduct', () => ({
  useSaveAdminProductMutation: () => ({
    isPending: false,
    mutateAsync: mocks.saveProduct,
  }),
  useDeleteAdminProductMutation: () => ({
    isPending: false,
    mutateAsync: mocks.deleteProduct,
  }),
}));

vi.mock('./AdminProductListSection', () => ({
  default: ({
    products,
    onDelete,
  }: {
    products: AdminProduct[];
    onDelete: (product: AdminProduct) => void;
  }) => {
    mocks.renderProductList();
    return (
      <div>
        productList
        {products[0] ? (
          <button type="button" onClick={() => onDelete(products[0])}>
            deleteProduct
          </button>
        ) : null}
      </div>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.saveProduct.mockResolvedValue(data.products.items[0]);
  mocks.deleteProduct.mockResolvedValue({ id: 10 });
});

describe('AdminProductSection', () => {
  it('상품 입력 중 목록을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <AdminProductSection
        data={data}
        params={{ page: 1, limit: 20, keyword: '', categoryId: '' }}
        isPending={false}
        isFetching={false}
        canWriteAdmin
        onKeywordChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPageChange={vi.fn()}
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    const nameInput = await screen.findByLabelText('nameKo');
    const renderCountBeforeTyping = mocks.renderProductList.mock.calls.length;

    await user.type(nameInput, '가');

    expect(mocks.renderProductList).toHaveBeenCalledTimes(
      renderCountBeforeTyping,
    );
  });

  it('수정한 번역과 동적 색상·이미지 값을 RHF payload로 저장한다', async () => {
    const user = userEvent.setup();
    render(
      <AdminProductSection
        data={data}
        params={{ page: 1, limit: 20, keyword: '', categoryId: '' }}
        isPending={false}
        isFetching={false}
        canWriteAdmin
        onKeywordChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPageChange={vi.fn()}
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    const nameInput = await screen.findByLabelText('nameKo');
    await user.clear(nameInput);
    await user.type(nameInput, '수정 마우스');
    await user.click(screen.getByLabelText('검정'));
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.type(screen.getByLabelText('urlLabel'), 'https://image.test/1');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mocks.saveProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          name_ko: '수정 마우스',
          colorIds: ['2'],
          defaultColorId: '2',
          translations: expect.objectContaining({
            ko: expect.objectContaining({ name: '수정 마우스' }),
          }),
          images: [
            expect.objectContaining({
              image_url: 'https://image.test/1',
              colorId: '2',
              order: '0',
              isMain: true,
            }),
          ],
        }),
      );
    });
  });

  it('선택 해제한 색상을 이미지 연결과 기본 색상에서도 제거한다', async () => {
    const user = userEvent.setup();
    render(
      <AdminProductSection
        data={data}
        params={{ page: 1, limit: 20, keyword: '', categoryId: '' }}
        isPending={false}
        isFetching={false}
        canWriteAdmin
        onKeywordChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPageChange={vi.fn()}
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    await screen.findByLabelText('nameKo');
    const colorCheckbox = screen.getByLabelText('검정');
    await user.click(colorCheckbox);
    await user.click(screen.getByRole('button', { name: 'add' }));

    expect(screen.getByLabelText('defaultColor')).toHaveValue('2');
    expect(screen.getByLabelText('linkedColor')).toHaveValue('2');

    await user.click(colorCheckbox);

    expect(screen.queryByLabelText('defaultColor')).not.toBeInTheDocument();
    expect(screen.getByLabelText('linkedColor')).toHaveValue('');
  });

  it('마지막 상품을 삭제하면 신규 상품 폼으로 전환한다', async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <AdminProductSection
        data={data}
        params={{ page: 1, limit: 20, keyword: '', categoryId: '' }}
        isPending={false}
        isFetching={false}
        canWriteAdmin
        onKeywordChange={vi.fn()}
        onCategoryChange={vi.fn()}
        onPageChange={vi.fn()}
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    expect(await screen.findByLabelText('nameKo')).toHaveValue('아스터 마우스');

    await user.click(screen.getByRole('button', { name: 'deleteProduct' }));

    await waitFor(() => {
      expect(mocks.deleteProduct).toHaveBeenCalledWith(10);
    });
    expect(await screen.findByText('createTitle')).toBeVisible();
    expect(screen.getByLabelText('nameKo')).toHaveValue('');

    confirm.mockRestore();
  });
});
