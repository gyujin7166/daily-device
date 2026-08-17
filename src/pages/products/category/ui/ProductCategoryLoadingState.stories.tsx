import ProductCategoryLoadingState from './ProductCategoryLoadingState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Pages/Products/ProductCategoryLoadingState',
  component: ProductCategoryLoadingState,
  tags: ['autodocs'],
} satisfies Meta<typeof ProductCategoryLoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
