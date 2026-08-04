import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminHeroSection from './AdminHeroSection';

import type { AdminHeroPayload, HeroFormState } from '../model/types';

const mocks = vi.hoisted(() => ({
  renderHeroList: vi.fn(),
  saveHero: vi.fn(),
  deleteHero: vi.fn(),
}));

const data: AdminHeroPayload = {
  heroTypes: [
    { id: 1, name: 'main' },
    { id: 2, name: 'product' },
  ],
  categories: [
    {
      id: 10,
      name_en: 'Keyboards',
      name_ko: '키보드',
      slug: 'keyboards',
    },
  ],
  heroes: [
    {
      id: 100,
      name_en: 'Existing hero',
      name_ko: '기존 Hero',
      image_url: null,
      image_width: null,
      image_height: null,
      description: null,
      detailed_description: null,
      position: 'center',
      isDefault: true,
      textTone: 'light',
      navTone: 'light',
      overlayTone: 'none',
      heroTypeId: 1,
      heroType: { id: 1, name: 'main' },
      targetCategoryId: null,
      targetCategory: null,
      translations: [
        {
          locale: 'ko',
          name: '기존 Hero',
          description: null,
          detailed_description: null,
        },
        {
          locale: 'en',
          name: 'Existing hero',
          description: null,
          detailed_description: null,
        },
      ],
    },
  ],
};

vi.mock('next-intl', () => ({
  useLocale: () => 'ko',
  useTranslations: () => (key: string) => key,
}));

vi.mock('../queries/useAdminHero', () => ({
  useSaveAdminHeroMutation: () => ({
    isPending: false,
    mutateAsync: mocks.saveHero,
  }),
  useDeleteAdminHeroMutation: () => ({
    isPending: false,
    mutateAsync: mocks.deleteHero,
  }),
}));

vi.mock('./AdminHeroListSection', () => ({
  default: () => {
    mocks.renderHeroList();
    return <div>heroList</div>;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.saveHero.mockImplementation(async (form: HeroFormState) => ({
    ...data.heroes[0],
    name_en: form.name_en,
    name_ko: form.name_ko,
    translations: [
      { locale: 'ko' as const, ...form.translations.ko },
      { locale: 'en' as const, ...form.translations.en },
    ],
  }));
  mocks.deleteHero.mockResolvedValue({ id: 100 });
});

describe('AdminHeroSection', () => {
  it('Hero 입력 중 목록을 다시 렌더하지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <AdminHeroSection
        data={data}
        isPending={false}
        canWriteAdmin
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    const nameInput = await screen.findByLabelText('form.nameKo');
    const renderCountBeforeTyping = mocks.renderHeroList.mock.calls.length;

    await user.type(nameInput, '가');

    expect(mocks.renderHeroList).toHaveBeenCalledTimes(renderCountBeforeTyping);
  });

  it('수정한 번역 값을 RHF payload로 저장한다', async () => {
    const user = userEvent.setup();
    render(
      <AdminHeroSection
        data={data}
        isPending={false}
        canWriteAdmin
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    const nameInput = await screen.findByLabelText('form.nameKo');
    await user.clear(nameInput);
    await user.type(nameInput, '수정 Hero');
    await user.click(screen.getByRole('button', { name: 'form.save' }));

    await waitFor(() => {
      expect(mocks.saveHero).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 100,
          name_ko: '수정 Hero',
          translations: expect.objectContaining({
            ko: expect.objectContaining({ name: '수정 Hero' }),
          }),
        }),
      );
    });
  });

  it('상품 Hero를 선택하면 기본 카테고리와 이름을 폼 내부에서 설정한다', async () => {
    const user = userEvent.setup();
    render(
      <AdminHeroSection
        data={data}
        isPending={false}
        canWriteAdmin
        onMessage={vi.fn()}
        onError={vi.fn()}
        onReadOnlyAction={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'form.new' }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: /form.type/ }),
      '2',
    );

    expect(
      screen.getByRole('combobox', { name: /form.targetCategory/ }),
    ).toHaveValue('10');
    expect(screen.getByLabelText('form.nameKo')).toHaveValue('키보드');
  });
});
