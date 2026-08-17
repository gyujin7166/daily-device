import ProductDetailLoadingState from './ProductDetailLoadingState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/ProductDetail/ProductDetailLoadingState',
  component: ProductDetailLoadingState,
  tags: ['autodocs'],
} satisfies Meta<typeof ProductDetailLoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
