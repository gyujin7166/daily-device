import ProductSkeleton from './ProductSkeleton';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Entities/Product/ProductSkeleton',
  component: ProductSkeleton,
  tags: ['autodocs'],
  args: {
    columns: 'three',
    length: 3,
  },
  argTypes: {
    columns: {
      control: 'inline-radio',
      options: ['three', 'four'],
    },
  },
} satisfies Meta<typeof ProductSkeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
