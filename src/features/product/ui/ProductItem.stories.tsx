import { expect, userEvent } from 'storybook/test';

import ProductItem from './ProductItem';

import type { ProductItemProduct } from '../model/productItem';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const sampleProduct: ProductItemProduct = {
  id: 101,
  name_en: 'Arc One Mechanical Keyboard',
  slug: 'arc-one-mechanical-keyboard',
  description: 'A compact wireless keyboard designed for a clean daily setup.',
  productLine: 'Daily Workspace',
  price: 189000,
  originalPrice: 219000,
  discountedPrice: 189000,
  discountRate: 14,
  isDiscounted: true,
  image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
  category: {
    name_en: 'Keyboard',
    slug: 'keyboard',
  },
  productColor: [
    {
      id: 1,
      isDefault: true,
      color: {
        name: 'Graphite',
        hex: '#343a40',
      },
    },
    {
      id: 2,
      color: {
        name: 'Cloud',
        hex: '#e9ecef',
      },
    },
    {
      id: 3,
      color: {
        name: 'Mint',
        hex: '#63e6be',
      },
    },
  ],
};

const meta = {
  title: 'Features/Product/ProductItem',
  component: ProductItem,
  tags: ['autodocs'],
  args: {
    product: sampleProduct,
  },
  argTypes: {
    product: {
      control: 'object',
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-sm">
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
} satisfies Meta<typeof ProductItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SelectColor: Story = {
  name: 'Select Color',
  play: async ({ canvas }) => {
    const graphiteButton = canvas.getByRole('button', { name: /Graphite/ });
    const cloudButton = canvas.getByRole('button', { name: /Cloud/ });

    await expect(graphiteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(cloudButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(cloudButton);
    await expect(graphiteButton).toHaveAttribute('aria-pressed', 'false');
    await expect(cloudButton).toHaveAttribute('aria-pressed', 'true');
  },
};
