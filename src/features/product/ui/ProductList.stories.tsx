import { expect, fn, userEvent, waitFor } from 'storybook/test';

import type { CatalogProductItem } from '@entities/product/model/types';

import ProductList from './ProductList';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const PRODUCT_IMAGE_SRC = '/images/storybook/featured-breeze-mouse-desk.webp';

const productNames = [
  'Arc One Mechanical Keyboard',
  'Orbit Wireless Mouse',
  'Frame Studio Monitor',
  'Wave USB Microphone',
];

const catalogProducts: CatalogProductItem[] = Array.from(
  { length: 24 },
  (_, index) => {
    const id = 101 + index;
    const price = 59000 + index * 5000;
    const name = `${productNames[index % productNames.length]} ${index + 1}`;

    return {
      id,
      name_en: name,
      slug: name.toLowerCase().replaceAll(' ', '-'),
      description: 'A practical device designed for a clean daily workspace.',
      productLine: 'EVERYDAY_LINE',
      price,
      originalPrice: price,
      discountedPrice: price,
      discountRate: 0,
      isDiscounted: false,
      priceLabel: `${price.toLocaleString('ko-KR')}원`,
      originalPriceLabel: `${price.toLocaleString('ko-KR')}원`,
      discountedPriceLabel: `${price.toLocaleString('ko-KR')}원`,
      category: {
        id: 1,
        name_en: 'Workspace',
        name_ko: '워크스페이스',
        slug: 'workspace',
        parentId: null,
        displayOrder: 1,
        image_url: null,
        isVisible: true,
      },
      filter: [],
      ProductImage: [
        {
          image_url: PRODUCT_IMAGE_SRC,
          isMain: true,
          productColorId: id,
          order: 0,
        },
      ],
      productColor: [
        {
          id,
          isDefault: true,
          color: {
            name: 'Graphite',
            hex: '#343a40',
          },
        },
      ],
    };
  },
);

const meta = {
  title: 'Features/Product/ProductList',
  component: ProductList,
  tags: ['autodocs'],
  args: {
    products: catalogProducts.slice(0, 8),
    isPending: false,
    columns: 'four',
    totalCount: 8,
    hasNextPage: false,
    fetchNextPage: fn(),
    isFetchingNextPage: false,
    isRefreshing: false,
    resetKey: 'default',
  },
  argTypes: {
    products: {
      control: false,
    },
    columns: {
      control: 'inline-radio',
      options: ['three', 'four'],
    },
    fetchNextPage: {
      control: false,
      table: { disable: true },
    },
    emptyAction: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-7xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products',
      },
    },
  },
} satisfies Meta<typeof ProductList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    products: [],
    isPending: true,
    totalCount: 0,
  },
};

export const Empty: Story = {
  args: {
    products: [],
    totalCount: 0,
  },
};

export const Refreshing: Story = {
  args: {
    isRefreshing: true,
  },
};

export const FetchingNextPage: Story = {
  name: 'Fetching Next Page',
  args: {
    totalCount: 12,
    hasNextPage: true,
    isFetchingNextPage: true,
  },
};

export const BackToTop: Story = {
  name: 'Back to Top',
  args: {
    products: catalogProducts,
    totalCount: catalogProducts.length,
  },
  play: async ({ canvas, canvasElement }) => {
    const storyWindow = canvasElement.ownerDocument.defaultView;

    if (!storyWindow) {
      throw new Error('Story window is unavailable.');
    }

    storyWindow.scrollTo({ top: 800, behavior: 'auto' });
    storyWindow.dispatchEvent(new storyWindow.Event('scroll'));

    const backToTopButton = canvas.getByRole('button', {
      name: /최상단으로 이동|Back to top/i,
    });

    await waitFor(() => expect(storyWindow.scrollY).toBeGreaterThan(720));
    await waitFor(() => expect(backToTopButton).toBeVisible());
    await userEvent.click(backToTopButton);
    await waitFor(() => expect(storyWindow.scrollY).toBeLessThan(1));
  },
};
