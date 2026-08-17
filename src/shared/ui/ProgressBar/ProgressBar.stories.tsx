import ProgressBar from './ProgressBar';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Shared/ProgressBar',
  component: ProgressBar,
  tags: ['autodocs'],
  args: {
    progress: 50,
    animateDelayMs: 0,
    animateDurationMs: 700,
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    progress: 0,
  },
};

export const Default: Story = {};

export const Complete: Story = {
  args: {
    progress: 100,
  },
};
