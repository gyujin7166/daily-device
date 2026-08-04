import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminHomeSection from './AdminHomeSection';

import type { AdminHomePayload } from '../model/types';

const mocks = vi.hoisted(() => ({
  renderSectionList: vi.fn(),
  updateSection: vi.fn(),
  saveItem: vi.fn(),
}));

const data: AdminHomePayload = {
  sections: [
    {
      id: 1,
      key: 'category-carousel',
      eyebrow: 'Featured',
      title: 'Featured products',
      subtitle: 'A selection',
      displayOrder: 1,
      isVisible: true,
      translations: [
        {
          locale: 'ko',
          eyebrow: '추천',
          title: '추천 상품',
          subtitle: '추천 목록',
        },
        {
          locale: 'en',
          eyebrow: 'Featured',
          title: 'Featured products',
          subtitle: 'A selection',
        },
      ],
      items: [
        {
          id: 10,
          sectionId: 1,
          label: 'New',
          title: 'Aster Mouse',
          description: 'A compact mouse.',
          cta: 'View',
          href: null,
          targetCategoryId: null,
          targetCategory: null,
          targetProductId: null,
          targetProduct: null,
          image_url: 'https://image.test/aster.jpg',
          imageAlt: 'Aster Mouse',
          displayOrder: 1,
          isVisible: true,
          layoutGroup: 1,
          layoutGroupClassName: 'lg:grid-areas-home-3',
          layoutAreaClassName: 'lg:grid-in-j',
          labelPosition: 'top',
          imageClassName: 'object-cover',
          translations: [
            {
              locale: 'ko',
              label: '신상품',
              title: '아스터 마우스',
              description: '컴팩트한 마우스입니다.',
              cta: '보기',
              imageAlt: '아스터 마우스',
            },
            {
              locale: 'en',
              label: 'New',
              title: 'Aster Mouse',
              description: 'A compact mouse.',
              cta: 'View',
              imageAlt: 'Aster Mouse',
            },
          ],
        },
      ],
    },
  ],
  categories: [
    {
      id: 2,
      name_en: 'Mice',
      name_ko: '마우스',
      slug: 'mice',
    },
  ],
  products: [
    {
      id: 3,
      name_en: 'Aster Mouse',
      name_ko: '아스터 마우스',
      slug: 'aster-mouse',
      category: { slug: 'mice' },
    },
  ],
};

vi.mock('next-intl', () => ({
  useFormatter: () => ({ number: (value: number) => String(value) }),
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => key,
}));

vi.mock('@shared/ui/AdminControls', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@shared/ui/AdminControls')>();

  return {
    ...actual,
    TableHeader: ({ title }: { title: string }) => {
      mocks.renderSectionList();
      return <div>{title}</div>;
    },
  };
});

vi.mock('../queries/useAdminHome', () => ({
  useUpdateAdminHomeSectionMutation: () => ({
    isPending: false,
    mutateAsync: mocks.updateSection,
  }),
  useSaveAdminHomeSectionItemMutation: () => ({
    isPending: false,
    mutateAsync: mocks.saveItem,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.updateSection.mockResolvedValue(data.sections[0]);
  mocks.saveItem.mockResolvedValue(data.sections[0].items[0]);
});

const renderSection = () =>
  render(
    <AdminHomeSection
      data={data}
      isPending={false}
      canWriteAdmin
      onMessage={vi.fn()}
      onError={vi.fn()}
      onReadOnlyAction={vi.fn()}
    />,
  );

describe('AdminHomeSection', () => {
  it('섹션 입력 중 목록을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    renderSection();

    const titleInput = await screen.findByLabelText('sectionTitle');
    const renderCountBeforeTyping = mocks.renderSectionList.mock.calls.length;

    await user.type(titleInput, '가');

    expect(mocks.renderSectionList).toHaveBeenCalledTimes(
      renderCountBeforeTyping,
    );
  });

  it('카드 입력 중 목록을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    renderSection();

    const titleInput = await screen.findByLabelText('cardForm.title');
    const renderCountBeforeTyping = mocks.renderSectionList.mock.calls.length;

    await user.type(titleInput, '가');

    expect(mocks.renderSectionList).toHaveBeenCalledTimes(
      renderCountBeforeTyping,
    );
  });

  it('수정한 섹션 번역 값을 RHF payload로 저장한다', async () => {
    const user = userEvent.setup();
    renderSection();

    const titleInput = await screen.findByLabelText('sectionTitle');
    await user.clear(titleInput);
    await user.type(titleInput, '수정 섹션');
    await user.click(screen.getByRole('button', { name: 'save' }));

    await waitFor(() => {
      expect(mocks.updateSection).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: '수정 섹션',
          translations: expect.objectContaining({
            ko: expect.objectContaining({ title: '수정 섹션' }),
          }),
        }),
      );
    });
  });

  it('카드 번역과 대상 선택 값을 RHF payload로 저장한다', async () => {
    const user = userEvent.setup();
    renderSection();

    const titleInput = await screen.findByLabelText('cardForm.title');
    await user.clear(titleInput);
    await user.type(titleInput, '수정 카드');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'title' }),
      'category',
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'category' }),
      '2',
    );
    await user.click(screen.getByRole('button', { name: 'cardForm.save' }));

    await waitFor(() => {
      expect(mocks.saveItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          title: '수정 카드',
          targetType: 'category',
          targetCategoryId: '2',
          targetProductId: '',
          href: '',
          translations: expect.objectContaining({
            ko: expect.objectContaining({ title: '수정 카드' }),
          }),
        }),
      );
    });
  });

  it('새 카드의 레이아웃 preset에 사용하지 않은 첫 위치를 배정한다', async () => {
    const user = userEvent.setup();
    renderSection();

    await screen.findByLabelText('cardForm.title');
    await user.click(screen.getByRole('button', { name: 'add' }));
    await user.click(screen.getByText('cardForm.layoutOptions'));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'cardForm.layoutPreset' }),
      'lg:grid-areas-home-3',
    );

    expect(screen.getByLabelText('cardForm.carouselPage')).toHaveValue(1);
    expect(
      screen.getByRole('combobox', { name: 'cardForm.cardPosition' }),
    ).toHaveValue('lg:grid-in-k');
  });
});
