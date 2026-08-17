import ProductAllLoadingState from './ProductAllLoadingState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Pages/Products/ProductAllLoadingState',
  component: ProductAllLoadingState,
  tags: ['autodocs'],
} satisfies Meta<typeof ProductAllLoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
