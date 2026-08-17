import CheckoutOrderCompleteLoadingState from './CheckoutOrderCompleteLoadingState';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/Checkout/CheckoutOrderCompleteLoadingState',
  component: CheckoutOrderCompleteLoadingState,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckoutOrderCompleteLoadingState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
