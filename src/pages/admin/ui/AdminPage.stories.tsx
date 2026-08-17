import { HttpResponse, delay, http } from 'msw';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import type { AdminHeroPayload } from '@features/admin-hero/model/types';
import type { AdminHomePayload } from '@features/admin-home/model/types';
import type { AdminProductPayload } from '@features/admin-product/model/types';
import type { AdminReviewPayload } from '@features/admin-review/model/types';

import { ADMIN_ERROR_CODE } from '@shared/constants/adminErrorCode';
import { API_ERROR_CODE } from '@shared/constants/apiErrorCode';

import AdminPage from './AdminPage';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const category = {
  id: 1,
  name_en: 'Keyboard',
  name_ko: '키보드',
  slug: 'keyboard',
};

const heroPayload: AdminHeroPayload = {
  heroTypes: [
    { id: 1, name: 'main' },
    { id: 2, name: 'product' },
    { id: 3, name: 'product-all' },
  ],
  categories: [category],
  heroes: [
    {
      id: 101,
      name_en: 'Build your daily setup',
      name_ko: '매일의 작업 환경을 완성하세요',
      image_url: '/images/storybook/hero-pixel-keys-flow.webp',
      image_width: 1920,
      image_height: 1080,
      description: 'Discover devices selected for work and everyday use.',
      detailed_description: 'A representative main Hero for Daily Device.',
      position: 'center',
      isDefault: true,
      textTone: 'dark',
      navTone: 'dark',
      overlayTone: 'light',
      heroTypeId: 1,
      heroType: { id: 1, name: 'main' },
      targetCategoryId: null,
      targetCategory: null,
      translations: [
        {
          locale: 'ko',
          name: '매일의 작업 환경을 완성하세요',
          description: '일과 일상을 위한 기기를 만나보세요.',
          detailed_description: 'Daily Device의 대표 메인 Hero입니다.',
        },
        {
          locale: 'en',
          name: 'Build your daily setup',
          description: 'Discover devices selected for work and everyday use.',
          detailed_description: 'A representative main Hero for Daily Device.',
        },
      ],
    },
    {
      id: 102,
      name_en: category.name_en,
      name_ko: category.name_ko,
      image_url: '/images/storybook/hero-pixel-keys-flow.webp',
      image_width: 1920,
      image_height: 1080,
      description: 'Keyboards for focused work.',
      detailed_description: null,
      position: 'end',
      isDefault: true,
      textTone: 'light',
      navTone: 'light',
      overlayTone: 'dark',
      heroTypeId: 2,
      heroType: { id: 2, name: 'product' },
      targetCategoryId: category.id,
      targetCategory: category,
      translations: [
        {
          locale: 'ko',
          name: category.name_ko,
          description: '집중을 위한 키보드를 만나보세요.',
          detailed_description: null,
        },
        {
          locale: 'en',
          name: category.name_en,
          description: 'Keyboards for focused work.',
          detailed_description: null,
        },
      ],
    },
  ],
};

const updatedHero = {
  ...heroPayload.heroes[0],
  name_ko: '스토리북에서 수정한 Hero',
  translations: heroPayload.heroes[0].translations.map((translation) =>
    translation.locale === 'ko'
      ? { ...translation, name: '스토리북에서 수정한 Hero' }
      : translation,
  ),
};

const createdProductHero = {
  ...heroPayload.heroes[1],
  id: 103,
  isDefault: false,
};

let isHeroDeleted = false;

const homePayload: AdminHomePayload = {
  categories: [category],
  products: [
    {
      id: 201,
      name_en: 'Arc One Mechanical Keyboard',
      name_ko: '아크 원 기계식 키보드',
      slug: 'arc-one-mechanical-keyboard',
      category: { slug: category.slug },
    },
  ],
  sections: [
    {
      id: 301,
      key: 'daily-picks',
      eyebrow: 'DAILY PICKS',
      title: 'Daily picks',
      subtitle: 'Devices selected for an everyday workspace.',
      displayOrder: 1,
      isVisible: true,
      translations: [
        {
          locale: 'ko',
          eyebrow: 'DAILY PICKS',
          title: '오늘의 추천',
          subtitle: '매일의 작업 환경을 위한 기기입니다.',
        },
        {
          locale: 'en',
          eyebrow: 'DAILY PICKS',
          title: 'Daily picks',
          subtitle: 'Devices selected for an everyday workspace.',
        },
      ],
      items: [
        {
          id: 401,
          sectionId: 301,
          label: 'KEYBOARD',
          title: 'Arc One Mechanical Keyboard',
          description: 'A compact keyboard for a clean workspace.',
          cta: 'View product',
          href: null,
          targetCategoryId: null,
          targetCategory: null,
          targetProductId: 201,
          targetProduct: {
            id: 201,
            name_en: 'Arc One Mechanical Keyboard',
            name_ko: '아크 원 기계식 키보드',
            slug: 'arc-one-mechanical-keyboard',
            category: { slug: category.slug },
          },
          image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
          imageAlt: 'Arc One Mechanical Keyboard',
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
              label: '키보드',
              title: '아크 원 기계식 키보드',
              description: '깔끔한 작업 환경을 위한 콤팩트 키보드입니다.',
              cta: '상품 보기',
              imageAlt: '아크 원 기계식 키보드',
            },
            {
              locale: 'en',
              label: 'KEYBOARD',
              title: 'Arc One Mechanical Keyboard',
              description: 'A compact keyboard for a clean workspace.',
              cta: 'View product',
              imageAlt: 'Arc One Mechanical Keyboard',
            },
          ],
        },
      ],
    },
  ],
};

const updatedHomeSection = {
  ...homePayload.sections[0],
  title: 'Storybook Home Section',
  translations: homePayload.sections[0].translations.map((translation) => ({
    ...translation,
    title: 'Storybook Home Section',
  })),
};

let isHomeSectionUpdated = false;

const updatedHomeCard = {
  ...homePayload.sections[0].items[0],
  title: 'Storybook Updated Card',
  translations: homePayload.sections[0].items[0].translations.map(
    (translation) => ({
      ...translation,
      title: 'Storybook Updated Card',
    }),
  ),
};

const createdHomeCard = {
  ...homePayload.sections[0].items[0],
  id: 402,
  label: 'NEW',
  title: 'Storybook New Card',
  description: 'A new home card created in Storybook.',
  cta: null,
  href: null,
  targetProductId: null,
  targetProduct: null,
  imageAlt: 'Storybook New Card',
  displayOrder: 2,
  isVisible: false,
  layoutGroup: 0,
  layoutGroupClassName: null,
  layoutAreaClassName: null,
  labelPosition: null,
  imageClassName: null,
  translations: homePayload.sections[0].items[0].translations.map(
    (translation) => ({
      ...translation,
      label: 'NEW',
      title: 'Storybook New Card',
      description: 'A new home card created in Storybook.',
      cta: null,
      imageAlt: 'Storybook New Card',
    }),
  ),
};

let homeCardStoryState: 'default' | 'updated' | 'created' = 'default';

const getHomeCardStoryPayload = (): AdminHomePayload => {
  const items =
    homeCardStoryState === 'updated'
      ? [updatedHomeCard]
      : homeCardStoryState === 'created'
        ? [...homePayload.sections[0].items, createdHomeCard]
        : homePayload.sections[0].items;

  return {
    ...homePayload,
    sections: [
      {
        ...homePayload.sections[0],
        items,
      },
    ],
  };
};

const graphiteColor = {
  id: 501,
  name: 'Graphite',
  hex: '#343a40',
  translations: [
    { locale: 'ko' as const, name: '그래파이트' },
    { locale: 'en' as const, name: 'Graphite' },
  ],
};

const productPayload: AdminProductPayload = {
  categories: [category],
  colors: [graphiteColor],
  products: {
    items: [
      {
        id: 201,
        name_en: 'Arc One Mechanical Keyboard',
        name_ko: '아크 원 기계식 키보드',
        slug: 'arc-one-mechanical-keyboard',
        search_keyword: 'keyboard mechanical compact',
        description: 'A compact keyboard for a clean workspace.',
        detailed_description:
          'Reliable multi-device connectivity for work throughout the day.',
        note: null,
        price: 219000,
        discountRate: 14,
        productLine: 'EVERYDAY_LINE',
        categoryId: category.id,
        createdAt: '2026-07-01T09:00:00.000Z',
        category,
        productColor: [
          {
            id: 601,
            colorId: graphiteColor.id,
            isDefault: true,
            color: graphiteColor,
          },
        ],
        images: [
          {
            id: 701,
            image_url: '/images/storybook/featured-nook-keys-core.webp',
            order: 0,
            isMain: true,
            productColorId: 601,
            colorId: graphiteColor.id,
          },
        ],
        mainImageUrl: '/images/storybook/featured-nook-keys-core.webp',
        translations: [
          {
            locale: 'ko',
            name: '아크 원 기계식 키보드',
            description: '깔끔한 작업 환경을 위한 콤팩트 키보드입니다.',
            detailed_description:
              '하루 종일 안정적인 멀티 디바이스 연결을 제공합니다.',
            note: null,
          },
          {
            locale: 'en',
            name: 'Arc One Mechanical Keyboard',
            description: 'A compact keyboard for a clean workspace.',
            detailed_description:
              'Reliable multi-device connectivity for work throughout the day.',
            note: null,
          },
        ],
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

const updatedProduct = {
  ...productPayload.products.items[0],
  name_en: 'Storybook Updated Product',
  name_ko: 'Storybook Updated Product',
  translations: productPayload.products.items[0].translations.map(
    (translation) => ({
      ...translation,
      name: 'Storybook Updated Product',
    }),
  ),
};

const createdProduct = {
  ...productPayload.products.items[0],
  id: 202,
  name_en: 'Storybook Created Product',
  name_ko: 'Storybook Created Product',
  slug: 'storybook-created-product',
  search_keyword: 'storybook created product',
  description: 'A product created in the Storybook interaction story.',
  detailed_description: null,
  note: null,
  discountRate: 0,
  productLine: null,
  productColor: [],
  images: [],
  mainImageUrl: '',
  translations: productPayload.products.items[0].translations.map(
    (translation) => ({
      ...translation,
      name: 'Storybook Created Product',
      description: 'A product created in the Storybook interaction story.',
      detailed_description: null,
      note: null,
    }),
  ),
};

let isProductUpdated = false;
let isProductCreated = false;
let isProductDeleted = false;

const getProductStoryPayload = (): AdminProductPayload => ({
  ...productPayload,
  products: {
    ...productPayload.products,
    items: isProductUpdated ? [updatedProduct] : productPayload.products.items,
  },
});

const getProductCreateStoryPayload = (): AdminProductPayload => ({
  ...productPayload,
  products: {
    ...productPayload.products,
    items: isProductCreated
      ? [createdProduct, ...productPayload.products.items]
      : productPayload.products.items,
    total: isProductCreated ? 2 : productPayload.products.total,
  },
});

const getProductDeleteStoryPayload = (): AdminProductPayload => ({
  ...productPayload,
  products: {
    ...productPayload.products,
    items: isProductDeleted ? [] : productPayload.products.items,
    total: isProductDeleted ? 0 : productPayload.products.total,
  },
});

const reviewPayload: AdminReviewPayload = {
  reviews: {
    items: [
      {
        id: 801,
        rating: 5,
        title: 'Photo-ready setup',
        content:
          'The compact layout fits my desk and the typing feel is comfortable.',
        createdAt: '2026-07-18T09:30:00.000Z',
        updatedAt: '2026-07-18T09:30:00.000Z',
        adminHiddenAt: null,
        product: {
          id: 201,
          name_ko: '아크 원 기계식 키보드',
          name_en: 'Arc One Mechanical Keyboard',
          slug: 'arc-one-mechanical-keyboard',
          translations: [
            { locale: 'ko', name: '아크 원 기계식 키보드' },
            { locale: 'en', name: 'Arc One Mechanical Keyboard' },
          ],
        },
        orderItem: {
          colorName: 'Graphite',
          colorHex: '#343a40',
          colorTranslations: [
            { locale: 'ko', name: '그래파이트' },
            { locale: 'en', name: 'Graphite' },
          ],
        },
        user: {
          name: 'Storybook User',
          email: 'storybook@example.com',
        },
        images: [
          {
            id: 901,
            image_url: '/images/storybook/featured-nook-keys-core.webp',
            order: 0,
          },
        ],
      },
    ],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  summary: {
    total: 1,
    visible: 1,
    hidden: 0,
  },
};

const hiddenReview = {
  ...reviewPayload.reviews.items[0],
  adminHiddenAt: '2026-08-01T09:00:00.000Z',
};

let reviewStoryState: 'visible' | 'hidden' = 'visible';

const getReviewStoryPayload = (): AdminReviewPayload => {
  const isHidden = reviewStoryState === 'hidden';

  return {
    reviews: {
      ...reviewPayload.reviews,
      items: [isHidden ? hiddenReview : reviewPayload.reviews.items[0]],
    },
    summary: {
      total: 1,
      visible: isHidden ? 0 : 1,
      hidden: isHidden ? 1 : 0,
    },
  };
};

const heroHandler = http.get('*/api/admin/heroes', () =>
  HttpResponse.json({ items: heroPayload }),
);

const homeHandler = http.get('*/api/admin/home-sections', () =>
  HttpResponse.json({ items: homePayload }),
);

const productsHandler = http.get('*/api/admin/products', () =>
  HttpResponse.json({ items: productPayload }),
);

const reviewsHandler = http.get('*/api/admin/reviews', () =>
  HttpResponse.json({ items: reviewPayload }),
);

const defaultHandlers = [
  heroHandler,
  homeHandler,
  productsHandler,
  reviewsHandler,
];

const meta = {
  title: 'Pages/Admin/AdminPage',
  component: AdminPage,
  tags: ['autodocs'],
  args: {
    canWriteAdmin: true,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/admin' },
    },
    msw: {
      handlers: defaultHandlers,
    },
  },
} satisfies Meta<typeof AdminPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/admin/heroes', async () => {
          await delay('infinite');

          return HttpResponse.json({ items: heroPayload });
        }),
        homeHandler,
        productsHandler,
        reviewsHandler,
      ],
    },
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    canWriteAdmin: false,
  },
};

export const UpdateHero: Story = {
  name: 'Update Hero',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.put('*/api/admin/heroes/101', () =>
          HttpResponse.json({ items: updatedHero }),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    const nameInput = await canvas.findByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, updatedHero.name_ko);
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(/ID 101.*스토리북에서 수정한 Hero/),
    ).toBeVisible();
  },
};

export const CreateProductHero: Story = {
  name: 'Create Product Hero',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.post('*/api/admin/heroes', () =>
          HttpResponse.json({ items: createdProductHero }, { status: 201 }),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^신규$|^New$/ }),
    );
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /^타입|^Type/ }),
      '2',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(await canvas.findByText(/ID 103.*키보드/)).toBeVisible();
  },
};

export const HeroSaveError: Story = {
  name: 'Hero Save Error',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.put('*/api/admin/heroes/101', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.HERO_UPDATE_FAILED,
              message: 'Failed to update the Hero.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    const nameInput = await canvas.findByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, '저장 실패 재현');
    await userEvent.click(
      canvas.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^Hero를 수정할 수 없습니다\.$|^Could not update the Hero\.$/,
      ),
    ).toBeVisible();
  },
};

export const DeleteHero: Story = {
  name: 'Delete Hero',
  beforeEach: () => {
    isHeroDeleted = false;
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/admin/heroes', () =>
          HttpResponse.json({
            items: {
              ...heroPayload,
              heroes: isHeroDeleted
                ? heroPayload.heroes.filter((hero) => hero.id !== 101)
                : heroPayload.heroes,
            },
          }),
        ),
        homeHandler,
        productsHandler,
        reviewsHandler,
        http.delete('*/api/admin/heroes/101', () => {
          isHeroDeleted = true;

          return HttpResponse.json({ items: { id: 101 } });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    const deleteButtons = await canvas.findAllByRole('button', {
      name: /^삭제$|^Delete$/,
    });

    await userEvent.click(deleteButtons[0]);

    await expect(
      await canvas.findByText(/ID 101.*매일의 작업 환경을 완성하세요/),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.queryByRole('cell', { name: '101' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const HeroDeleteError: Story = {
  name: 'Hero Delete Error',
  beforeEach: () => {
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.delete('*/api/admin/heroes/101', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.HERO_DELETE_FAILED,
              message: 'Failed to delete the Hero.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    const deleteButtons = await canvas.findAllByRole('button', {
      name: /^삭제$|^Delete$/,
    });

    await userEvent.click(deleteButtons[0]);

    await expect(
      await canvas.findByText(
        /^Hero를 삭제할 수 없습니다\.$|^Could not delete the Hero\.$/,
      ),
    ).toBeVisible();
    await expect(canvas.getByRole('cell', { name: '101' })).toBeVisible();
  },
};

export const OpenHomeTab: Story = {
  name: 'Open Home Tab',
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^홈$|^Home$/ }));

    await expect(
      await canvas.findByText(/^홈 섹션$|^Home sections$/),
    ).toBeVisible();
  },
};

export const UpdateHomeSection: Story = {
  name: 'Update Home Section',
  beforeEach: () => {
    isHomeSectionUpdated = false;
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        http.get('*/api/admin/home-sections', () =>
          HttpResponse.json({
            items: {
              ...homePayload,
              sections: isHomeSectionUpdated
                ? [updatedHomeSection]
                : homePayload.sections,
            },
          }),
        ),
        productsHandler,
        reviewsHandler,
        http.put('*/api/admin/home-sections/301', () => {
          isHomeSectionUpdated = true;

          return HttpResponse.json({ items: updatedHomeSection });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const sectionFormHeading = await canvas.findByRole('heading', {
      name: /^섹션 수정$|^Edit section$/,
    });
    const sectionForm = within(
      sectionFormHeading.closest('form') as HTMLFormElement,
    );
    const titleInput = sectionForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatedHomeSection.title);
    await userEvent.click(
      sectionForm.getByRole('button', {
        name: /^섹션 저장$|^Save section$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션 수정 완료: Storybook Home Section$|^Home section updated: Storybook Home Section$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('button', {
        name: /^Storybook Home Section/,
      }),
    ).toBeVisible();
  },
};

export const HomeSectionSaveError: Story = {
  name: 'Home Section Save Error',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.put('*/api/admin/home-sections/301', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.HOME_SECTION_UPDATE_FAILED,
              message: 'Failed to update the home section.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const sectionFormHeading = await canvas.findByRole('heading', {
      name: /^섹션 수정$|^Edit section$/,
    });
    const sectionForm = within(
      sectionFormHeading.closest('form') as HTMLFormElement,
    );
    const titleInput = sectionForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Save Error Home Section');
    await userEvent.click(
      sectionForm.getByRole('button', {
        name: /^섹션 저장$|^Save section$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션을 수정할 수 없습니다\.$|^Could not update the home section\.$/,
      ),
    ).toBeVisible();
  },
};

export const UpdateHomeCard: Story = {
  name: 'Update Home Card',
  beforeEach: () => {
    homeCardStoryState = 'default';
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        http.get('*/api/admin/home-sections', () =>
          HttpResponse.json({ items: getHomeCardStoryPayload() }),
        ),
        productsHandler,
        reviewsHandler,
        http.put('*/api/admin/home-section-items/401', () => {
          homeCardStoryState = 'updated';

          return HttpResponse.json({ items: updatedHomeCard });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 수정$|^Edit card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);
    const titleInput = cardForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, updatedHomeCard.title);
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 저장$|^Save card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 카드 수정 완료: Storybook Updated Card$|^Home card updated completed: Storybook Updated Card$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Updated Card/ }),
    ).toBeVisible();
  },
};

export const CreateHomeCard: Story = {
  name: 'Create Home Card',
  beforeEach: () => {
    homeCardStoryState = 'default';
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        http.get('*/api/admin/home-sections', () =>
          HttpResponse.json({ items: getHomeCardStoryPayload() }),
        ),
        productsHandler,
        reviewsHandler,
        http.post('*/api/admin/home-section-items', () => {
          homeCardStoryState = 'created';

          return HttpResponse.json({ items: createdHomeCard }, { status: 201 });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /^카드 추가$|^Add card$/,
      }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 추가$|^Add card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);

    await userEvent.type(
      cardForm.getByRole('textbox', { name: /^제목$|^Title$/ }),
      createdHomeCard.title,
    );
    await userEvent.type(
      cardForm.getByRole('textbox', {
        name: /^이미지 URL$|^Image URL$/,
      }),
      createdHomeCard.image_url,
    );
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 추가$|^Add card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 카드 추가 완료: Storybook New Card$|^Home card created completed: Storybook New Card$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook New Card/ }),
    ).toBeVisible();
  },
};

export const HomeCardSaveError: Story = {
  name: 'Home Card Save Error',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.put('*/api/admin/home-section-items/401', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.HOME_CARD_UPDATE_FAILED,
              message: 'Failed to update the home card.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /^홈$|^Home$/ }),
    );

    const cardFormHeading = await canvas.findByRole('heading', {
      name: /^카드 수정$|^Edit card$/,
    });
    const cardForm = within(cardFormHeading.closest('form') as HTMLFormElement);
    const titleInput = cardForm.getByRole('textbox', {
      name: /^제목$|^Title$/,
    });

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Save Error Home Card');
    await userEvent.click(
      cardForm.getByRole('button', {
        name: /^카드 저장$|^Save card$/,
      }),
    );

    await expect(
      await canvas.findByText(
        /^홈 섹션 아이템을 수정할 수 없습니다\.$|^Could not update the home section item\.$/,
      ),
    ).toBeVisible();
  },
};

export const OpenProductsTab: Story = {
  name: 'Open Products Tab',
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    await expect(
      await canvas.findByText(/^상품 목록$|^Product list$/),
    ).toBeVisible();
  },
};

export const UpdateProduct: Story = {
  name: 'Update Product',
  beforeEach: () => {
    isProductUpdated = false;
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        homeHandler,
        http.get('*/api/admin/products', () =>
          HttpResponse.json({ items: getProductStoryPayload() }),
        ),
        reviewsHandler,
        http.put('*/api/admin/products/201', () => {
          isProductUpdated = true;

          return HttpResponse.json({ items: updatedProduct });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 수정$|^Edit product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, updatedProduct.name_ko);
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 수정 완료: ID 201 \/ 상품명: Storybook Updated Product$|^Product updated completed: ID 201 \/ Name: Storybook Updated Product$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Updated Product/ }),
    ).toBeVisible();
  },
};

export const CreateProduct: Story = {
  name: 'Create Product',
  beforeEach: () => {
    isProductCreated = false;
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        homeHandler,
        http.get('*/api/admin/products', () =>
          HttpResponse.json({ items: getProductCreateStoryPayload() }),
        ),
        reviewsHandler,
        http.post('*/api/admin/products', () => {
          isProductCreated = true;

          return HttpResponse.json({ items: createdProduct }, { status: 201 });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );
    await userEvent.click(
      await canvas.findByRole('button', { name: /^신규$|^New$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 추가$|^Add product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^English name$/,
    });
    const searchKeywordInput = productForm.queryByRole('textbox', {
      name: /^검색 키워드$|^Search keyword$/,
    });

    await userEvent.type(nameInput, createdProduct.name_ko);
    await userEvent.type(
      productForm.getByRole('textbox', { name: /^슬러그$|^Slug$/ }),
      createdProduct.slug,
    );
    if (searchKeywordInput) {
      await userEvent.type(searchKeywordInput, createdProduct.search_keyword);
    }
    await userEvent.type(
      productForm.getByRole('spinbutton', { name: /^가격$|^Price$/ }),
      String(createdProduct.price),
    );
    await userEvent.type(
      productForm.getByRole('textbox', { name: /^설명$|^Description$/ }),
      createdProduct.description,
    );
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 추가 완료: ID 202 \/ 상품명: Storybook Created Product$|^Product created completed: ID 202 \/ Name: Storybook Created Product$/,
      ),
    ).toBeVisible();
    await expect(
      await canvas.findByRole('row', { name: /Storybook Created Product/ }),
    ).toBeVisible();
  },
};

export const ProductSaveError: Story = {
  name: 'Product Save Error',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.put('*/api/admin/products/201', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.PRODUCT_UPDATE_FAILED,
              message: 'Failed to update the product.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 수정$|^Edit product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );
    const nameInput = productForm.getByRole('textbox', {
      name: /^한글 이름$|^Korean name$/,
    });

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Save Error Product');
    await userEvent.click(
      productForm.getByRole('button', { name: /^저장$|^Save$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품을 수정할 수 없습니다\.$|^Could not update the product\.$/,
      ),
    ).toBeVisible();
    await expect(nameInput).toHaveValue('Save Error Product');
  },
};

export const DeleteProduct: Story = {
  name: 'Delete Product',
  beforeEach: () => {
    isProductDeleted = false;
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        homeHandler,
        http.get('*/api/admin/products', () =>
          HttpResponse.json({ items: getProductDeleteStoryPayload() }),
        ),
        reviewsHandler,
        http.delete('*/api/admin/products/201', () => {
          isProductDeleted = true;

          return HttpResponse.json({ items: { id: 201 } });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productRow = await canvas.findByRole('row', { name: /201/ });

    await userEvent.click(
      within(productRow).getByRole('button', { name: /^삭제$|^Delete$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품 삭제 완료: ID 201 \/ 상품명: 아크 원 기계식 키보드$|^Product deleted: ID 201 \/ Name: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(
        canvas.queryByRole('row', { name: /201/ }),
      ).not.toBeInTheDocument();
    });

    const productFormHeading = await canvas.findByRole('heading', {
      name: /^상품 추가$|^Add product$/,
    });
    const productForm = within(
      productFormHeading.closest('form') as HTMLFormElement,
    );

    await expect(
      productForm.getByRole('textbox', {
        name: /^한글 이름$|^English name$/,
      }),
    ).toHaveValue('');
  },
};

export const ProductDeleteError: Story = {
  name: 'Product Delete Error',
  beforeEach: () => {
    const confirm = spyOn(window, 'confirm').mockReturnValue(true);

    return () => confirm.mockRestore();
  },
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.delete('*/api/admin/products/201', () =>
          HttpResponse.json(
            {
              code: ADMIN_ERROR_CODE.PRODUCT_DELETE_FAILED,
              message: 'Failed to delete the product.',
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품$|^Products$/ }),
    );

    const productRow = await canvas.findByRole('row', { name: /201/ });

    await userEvent.click(
      within(productRow).getByRole('button', { name: /^삭제$|^Delete$/ }),
    );

    await expect(
      await canvas.findByText(
        /^상품을 삭제할 수 없습니다\.$|^Could not delete the product\.$/,
      ),
    ).toBeVisible();
    await expect(productRow).toBeVisible();
  },
};

export const OpenReviewsTab: Story = {
  name: 'Open Reviews Tab',
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    await expect(
      await canvas.findByText(/^상품평 목록$|^Reviews$/),
    ).toBeVisible();
  },
};

export const HideReview: Story = {
  name: 'Hide Review',
  beforeEach: () => {
    reviewStoryState = 'visible';
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        homeHandler,
        productsHandler,
        http.get('*/api/admin/reviews', () =>
          HttpResponse.json({ items: getReviewStoryPayload() }),
        ),
        http.patch('*/api/admin/reviews/801', () => {
          reviewStoryState = 'hidden';

          return HttpResponse.json({ items: hiddenReview });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });

    await userEvent.click(hideButton);

    await expect(
      await canvas.findByText(
        /^상품평 숨김 처리 완료: ID 801 \/ 상품명 아크 원 기계식 키보드$|^Review hidden completed: ID 801 \/ Product: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();

    const restoreButton = await canvas.findByRole('button', {
      name: /^복원$|^Restore$/,
    });
    const hiddenReviewRow = restoreButton.closest('tr') as HTMLTableRowElement;

    await expect(
      within(hiddenReviewRow).getByText(/^숨김$|^Hidden$/),
    ).toBeVisible();

    const visibleReviewSummary = canvas.getByText(
      /^상품평 공개$|^Visible reviews$/,
    ).parentElement;

    await expect(
      within(visibleReviewSummary as HTMLElement).getByText('0'),
    ).toBeVisible();
  },
};

export const ShowReview: Story = {
  name: 'Show Review',
  beforeEach: () => {
    reviewStoryState = 'hidden';
  },
  parameters: {
    msw: {
      handlers: [
        heroHandler,
        homeHandler,
        productsHandler,
        http.get('*/api/admin/reviews', () =>
          HttpResponse.json({ items: getReviewStoryPayload() }),
        ),
        http.patch('*/api/admin/reviews/801', () => {
          reviewStoryState = 'visible';

          return HttpResponse.json({
            items: reviewPayload.reviews.items[0],
          });
        }),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const restoreButton = await canvas.findByRole('button', {
      name: /^복원$|^Restore$/,
    });

    await userEvent.click(restoreButton);

    await expect(
      await canvas.findByText(
        /^상품평 복원 완료: ID 801 \/ 상품명 아크 원 기계식 키보드$|^Review restored completed: ID 801 \/ Product: 아크 원 기계식 키보드$/,
      ),
    ).toBeVisible();

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });
    const visibleReviewRow = hideButton.closest('tr') as HTMLTableRowElement;

    await expect(
      within(visibleReviewRow).getByText(/^공개$|^Visible$/),
    ).toBeVisible();

    const visibleReviewSummary = canvas.getByText(
      /^상품평 공개$|^Visible reviews$/,
    ).parentElement;

    await expect(
      within(visibleReviewSummary as HTMLElement).getByText('1'),
    ).toBeVisible();
  },
};

export const ReviewStatusError: Story = {
  name: 'Review Status Error',
  parameters: {
    msw: {
      handlers: [
        ...defaultHandlers,
        http.patch('*/api/admin/reviews/801', () =>
          HttpResponse.json(
            { code: API_ERROR_CODE.REQUEST_FAILED },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /^상품평$|^Reviews$/ }),
    );

    const hideButton = await canvas.findByRole('button', {
      name: /^숨김$|^Hidden$/,
    });
    const reviewRow = hideButton.closest('tr') as HTMLTableRowElement;

    await userEvent.click(hideButton);

    await expect(
      await canvas.findByText(
        /^요청 처리에 실패했습니다\. 잠시 후 다시 시도해주세요\.$|^The request failed\. Please try again later\.$/,
      ),
    ).toBeVisible();
    await expect(within(reviewRow).getByText(/^공개$|^Visible$/)).toBeVisible();
    await expect(
      within(reviewRow).getByRole('button', { name: /^숨김$|^Hidden$/ }),
    ).toBeVisible();
  },
};
