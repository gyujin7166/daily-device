import { HttpResponse, http } from 'msw';
import { expect, fn, userEvent, waitFor } from 'storybook/test';

import type {
  ProductDetailResponse,
  ProductImageItem,
} from '@entities/product/model/types';
import type { ProductReviewsPayload } from '@entities/review/model/types';

import ProductDetail from './ProductDetail';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const productDetail: ProductDetailResponse = {
  product: {
    id: 101,
    productLine: 'EVERYDAY_LINE',
    name_en: 'Arc One Mechanical Keyboard',
    slug: 'arc-one-mechanical-keyboard',
    description:
      'A compact wireless keyboard designed for a clean everyday workspace.',
    detailed_description:
      'Reliable multi-device connectivity and a balanced typing feel make it suitable for work throughout the day.',
    price: 219000,
    originalPrice: 219000,
    discountedPrice: 189000,
    discountRate: 14,
    isDiscounted: true,
    priceLabel: '219,000원',
    originalPriceLabel: '219,000원',
    discountedPriceLabel: '189,000원',
    category: {
      name_en: 'Keyboard',
      name_ko: '키보드',
      slug: 'keyboard',
    },
    productColor: [
      {
        id: 201,
        isDefault: true,
        color: { name: 'Graphite', hex: '#343a40' },
      },
      {
        id: 202,
        isDefault: false,
        color: { name: 'Cloud', hex: '#e9ecef' },
      },
      {
        id: 203,
        isDefault: false,
        color: { name: 'Mint', hex: '#63e6be' },
      },
    ],
  },
  productDetails: [
    {
      id: 1,
      titleId: 1,
      title_middle: 'KEYBOARD',
      title_sub: 'Core specifications',
      specification: JSON.stringify([
        'Layout: Compact 75%',
        'Connection: Bluetooth 5.1 / USB-C',
        'Battery: Up to 80 hours',
      ]),
      note: 'Compatible with Windows, macOS, and mobile devices.',
    },
    {
      id: 2,
      titleId: 2,
      title_middle: 'COMPATIBILITY',
      title_sub: 'Supported platforms',
      specification: JSON.stringify([
        'Desktop: Windows 11 / macOS 14 or later',
        'Mobile: iOS / Android',
      ]),
      note: null,
    },
    {
      id: 3,
      titleId: 3,
      title_middle: 'IN THE BOX',
      title_sub: 'Included items',
      specification: JSON.stringify([
        'Arc One Mechanical Keyboard',
        'USB-C charging cable',
        'Quick start guide',
      ]),
      note: null,
    },
  ],
};

const productImages: ProductImageItem[] = [
  {
    id: 1,
    image_url: '/images/storybook/featured-nook-keys-core.webp',
    order: 0,
    isMain: true,
    productColorId: null,
  },
  {
    id: 2,
    image_url: '/images/storybook/category-tablet-keyboards.webp',
    order: 1,
    isMain: false,
    productColorId: 202,
  },
];

const reviewSummary: ProductReviewsPayload = {
  items: [],
  totalItems: 28,
  summaryTotalItems: 28,
  totalReviewImageCount: 8,
  averageRating: 4.6,
  ratingCounts: [0, 1, 3, 7, 17],
  totalPages: 5,
  currentPage: 1,
  perPage: 6,
};

const productDetailHandlers = [
  http.get('*/api/products/:slug/images', () =>
    HttpResponse.json({ items: productImages }),
  ),
  http.get('*/api/products/:slug', () =>
    HttpResponse.json({ items: productDetail }),
  ),
  http.get('*/api/product-reviews', () =>
    HttpResponse.json({ items: reviewSummary }),
  ),
];

const meta = {
  title: 'Features/ProductDetail/ProductDetail',
  component: ProductDetail,
  tags: ['autodocs'],
  args: {
    detail: 'arc-one-mechanical-keyboard',
    onSelectedColorChange: fn(),
  },
  argTypes: {
    onSelectedColorChange: { control: false, table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-surface p-6 shadow-sm dark:bg-dark-panel sm:p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products/keyboard/arc-one-mechanical-keyboard',
      },
    },
    msw: {
      handlers: productDetailHandlers,
    },
  },
} satisfies Meta<typeof ProductDetail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectColor: Story = {
  name: 'Select Color',
  play: async ({ canvas }) => {
    const graphiteButton = await canvas.findByRole('button', {
      name: /Graphite 색상 선택|Select Graphite color/,
    });
    const cloudButton = canvas.getByRole('button', {
      name: /Cloud 색상 선택|Select Cloud color/,
    });

    await expect(graphiteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(cloudButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(cloudButton);
    await expect(graphiteButton).toHaveAttribute('aria-pressed', 'false');
    await expect(cloudButton).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('Cloud')).toBeVisible();
  },
};

export const ChangeQuantity: Story = {
  name: 'Change Quantity',
  play: async ({ canvas }) => {
    const decreaseButton = await canvas.findByRole('button', {
      name: /수량 줄이기|Decrease quantity/,
    });
    const increaseButton = canvas.getByRole('button', {
      name: /수량 늘리기|Increase quantity/,
    });

    await expect(decreaseButton).toBeDisabled();
    await expect(canvas.getByText('1', { selector: 'span' })).toBeVisible();
    await userEvent.click(increaseButton);
    await expect(decreaseButton).toBeEnabled();
    await expect(canvas.getByText('2', { selector: 'span' })).toBeVisible();
  },
};

export const OpenSpecification: Story = {
  name: 'Open Specification',
  play: async ({ canvas }) => {
    const specificationButton = await canvas.findByRole('button', {
      name: /사양 및 세부정보|Specs and details/,
    });

    await expect(specificationButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(specificationButton);
    await expect(specificationButton).toHaveAttribute('aria-expanded', 'true');
    await waitFor(async () => {
      await expect(canvas.getByText(/Compact 75%/)).toBeVisible();
    });
  },
};
