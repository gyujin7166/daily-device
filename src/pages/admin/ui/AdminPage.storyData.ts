import type { AdminHeroPayload } from '@features/admin-hero/model/types';
import type { AdminHomePayload } from '@features/admin-home/model/types';
import type { AdminProductPayload } from '@features/admin-product/model/types';
import type { AdminReviewPayload } from '@features/admin-review/model/types';

export const category = {
  id: 1,
  name_en: 'Keyboard',
  name_ko: '키보드',
  slug: 'keyboard',
};

export const heroPayload: AdminHeroPayload = {
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

export const updatedHero = {
  ...heroPayload.heroes[0],
  name_ko: '스토리북에서 수정한 Hero',
  translations: heroPayload.heroes[0].translations.map((translation) =>
    translation.locale === 'ko'
      ? { ...translation, name: '스토리북에서 수정한 Hero' }
      : translation,
  ),
};

export const createdProductHero = {
  ...heroPayload.heroes[1],
  id: 103,
  isDefault: false,
};

export const homePayload: AdminHomePayload = {
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

export const updatedHomeSection = {
  ...homePayload.sections[0],
  title: 'Storybook Home Section',
  translations: homePayload.sections[0].translations.map((translation) => ({
    ...translation,
    title: 'Storybook Home Section',
  })),
};

export const updatedHomeCard = {
  ...homePayload.sections[0].items[0],
  title: 'Storybook Updated Card',
  translations: homePayload.sections[0].items[0].translations.map(
    (translation) => ({
      ...translation,
      title: 'Storybook Updated Card',
    }),
  ),
};

export const createdHomeCard = {
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

export const graphiteColor = {
  id: 501,
  name: 'Graphite',
  hex: '#343a40',
  translations: [
    { locale: 'ko' as const, name: '그래파이트' },
    { locale: 'en' as const, name: 'Graphite' },
  ],
};

export const productPayload: AdminProductPayload = {
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

export const updatedProduct = {
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

export const createdProduct = {
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

export const reviewPayload: AdminReviewPayload = {
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

export const hiddenReview = {
  ...reviewPayload.reviews.items[0],
  adminHiddenAt: '2026-08-01T09:00:00.000Z',
};
