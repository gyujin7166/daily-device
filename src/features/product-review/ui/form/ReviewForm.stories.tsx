import { expect, userEvent } from 'storybook/test';

import type { ProductReviewEditItem } from '@entities/review/model/types';

import ReviewForm from './ReviewForm';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const existingReview: ProductReviewEditItem = {
  id: 301,
  productId: 101,
  rating: 4,
  title: 'A solid keyboard for daily work',
  content:
    'The compact layout feels comfortable, and the wireless connection has been reliable.',
  adminHiddenAt: null,
  ProductReviewImage: [
    {
      image_url: '/images/storybook/featured-nook-keys-core.webp',
      blur_data_url: null,
      order: 0,
    },
  ],
};

const meta = {
  title: 'Features/ProductReview/ReviewForm',
  component: ReviewForm,
  tags: ['autodocs'],
  args: {
    productId: 101,
    orderItemId: 501,
    initialReview: null,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-sm dark:bg-dark-panel">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/my/orders/501/review' },
    },
  },
} satisfies Meta<typeof ReviewForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    initialReview: existingReview,
  },
};

export const ChangeRating: Story = {
  name: 'Change Rating',
  play: async ({ canvas }) => {
    const threeStarButton = canvas.getByRole('button', {
      name: /3점 선택|Select 3 stars/,
    });

    await expect(threeStarButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(threeStarButton);
    await expect(threeStarButton).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByText('3 / 5')).toBeVisible();
  },
};

export const ShowValidation: Story = {
  name: 'Show Validation',
  play: async ({ canvas }) => {
    const titleInput = canvas.getByPlaceholderText(
      /몇 마디로 경험을 요약|Summarize your experience/,
    );
    const contentInput = canvas.getByPlaceholderText(
      /어떤 점이 좋았나요|What did you like/,
    );

    await userEvent.type(titleInput, 'A');
    await userEvent.tab();
    await expect(
      canvas.getByText(/최소 2글자 이상|at least 2 characters/),
    ).toBeVisible();

    await userEvent.type(contentInput, 'Short');
    await userEvent.tab();
    await expect(
      canvas.getByText(/최소 10글자 이상|at least 10 characters/),
    ).toBeVisible();
  },
};
