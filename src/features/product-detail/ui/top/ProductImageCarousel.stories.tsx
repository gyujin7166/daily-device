import { HttpResponse, http } from 'msw';

import type { ProductImageItem } from '@entities/product/model/types';

import ProductImageCarousel from './ProductImageCarousel';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

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
    productColorId: null,
  },
  {
    id: 3,
    image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
    order: 2,
    isMain: false,
    productColorId: null,
  },
];

const colorProductImages: ProductImageItem[] = [
  {
    id: 4,
    image_url: '/images/storybook/featured-nook-keys-core.webp',
    order: 0,
    isMain: true,
    productColorId: 201,
  },
  {
    id: 5,
    image_url: '/images/storybook/category-tablet-keyboards.webp',
    order: 1,
    isMain: false,
    productColorId: 201,
  },
  ...productImages,
];

const createImagesHandler = (items: ProductImageItem[]) =>
  http.get('*/api/products/:slug/images', () => HttpResponse.json({ items }));

const meta = {
  title: 'Features/ProductDetail/ProductImageCarousel',
  component: ProductImageCarousel,
  tags: ['autodocs'],
  args: {
    detail: 'arc-one-mechanical-keyboard',
    selectedColorId: null,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-190">
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
      handlers: [createImagesHandler(productImages)],
    },
  },
} satisfies Meta<typeof ProductImageCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectedColor: Story = {
  name: 'Selected Color',
  args: {
    selectedColorId: 201,
  },
  parameters: {
    msw: {
      handlers: [createImagesHandler(colorProductImages)],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [createImagesHandler([])],
    },
  },
};
