import Spinner from './Spinner';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Shared/Loading/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  args: {
    size: 'md',
    variant: 'primary',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'inline-radio',
      options: ['primary', 'inverse', 'current'],
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-48 items-center justify-center">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inverse: Story = {
  args: {
    variant: 'inverse',
  },
  decorators: [
    (Story) => (
      <div className="rounded-3xl bg-dark-panel p-8">
        <Story />
      </div>
    ),
  ],
};
