import Button from './Button';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Shared/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
    size: 'md',
    transition: 'enabled',
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'inline-radio',
      options: ['md', 'lg'],
    },
    transition: {
      control: 'inline-radio',
      options: ['enabled', 'disabled'],
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-48 items-center justify-center rounded-3xl bg-dark-panel p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: 'secondary',
  },
};
