import { expect, fn } from 'storybook/test';

import ReviewFormActions from './ReviewFormActions';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/ProductReview/ReviewFormActions',
  component: ReviewFormActions,
  tags: ['autodocs'],
  args: {
    isEditing: false,
    isPending: false,
    isUploading: false,
    onCancel: fn(),
  },
  argTypes: {
    onCancel: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReviewFormActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    isEditing: true,
  },
};

export const Submitting: Story = {
  args: {
    isPending: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /등록 중|Submitting/ }),
    ).toBeDisabled();
  },
};

export const Uploading: Story = {
  args: {
    isUploading: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /이미지 업로드 중|Uploading image/ }),
    ).toBeDisabled();
  },
};
