import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent, waitFor } from 'storybook/test';

import type { ProductReviewGalleryImage } from '@entities/review/model/types';

import { ReviewGalleryModal } from './ReviewGalleryModal';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const firstReviewImages = [
  {
    id: 501,
    image_url: '/images/storybook/featured-nook-keys-core.webp',
    blur_data_url: null,
    order: 0,
  },
  {
    id: 502,
    image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
    blur_data_url: null,
    order: 1,
  },
];

const secondReviewImages = [
  {
    id: 503,
    image_url: '/images/storybook/featured-aster-webcam-mini.webp',
    blur_data_url: null,
    order: 0,
  },
];

const firstReview = {
  id: 301,
  rating: 5,
  title: 'A clean compact setup',
  content:
    'The keyboard leaves plenty of room for a mouse while keeping the navigation keys I use every day.',
  createdAt: '2026-07-18T09:30:00.000Z',
  helpfulCount: 12,
  currentUserVote: false,
  reviewImages: firstReviewImages,
  orderItem: { colorName: 'Graphite', colorHex: '#343a40' },
  user: { maskedUser: 'yun***' },
} satisfies ProductReviewGalleryImage['productReview'];

const secondReview = {
  id: 302,
  rating: 4,
  title: 'Comfortable for long sessions',
  content:
    'Pairing was quick on both my laptop and tablet, and the switches stay comfortable throughout the workday.',
  createdAt: '2026-07-12T14:20:00.000Z',
  helpfulCount: 7,
  currentUserVote: null,
  reviewImages: secondReviewImages,
  orderItem: { colorName: 'Cloud', colorHex: '#e9ecef' },
  user: { maskedUser: 'dev***' },
} satisfies ProductReviewGalleryImage['productReview'];

const galleryImages: ProductReviewGalleryImage[] = [
  {
    ...firstReviewImages[0],
    productReviewId: firstReview.id,
    productReview: firstReview,
  },
  {
    ...firstReviewImages[1],
    productReviewId: firstReview.id,
    productReview: firstReview,
  },
  {
    ...secondReviewImages[0],
    productReviewId: secondReview.id,
    productReview: secondReview,
  },
];

type ReviewGalleryModalStoryProps = ComponentProps<typeof ReviewGalleryModal>;

function ControlledReviewGalleryModal(args: ReviewGalleryModalStoryProps) {
  const [isOpen, setIsOpen] = useState(args.isOpen);

  useEffect(() => {
    setIsOpen(args.isOpen);
  }, [args.isOpen]);

  return (
    <ReviewGalleryModal
      {...args}
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
        args.onClose();
      }}
    />
  );
}

const meta = {
  title: 'Features/ProductReview/ReviewGalleryModal',
  component: ReviewGalleryModal,
  tags: ['autodocs'],
  render: (args) => <ControlledReviewGalleryModal {...args} />,
  args: {
    currentPath: '/products/keyboard/arc-one-mechanical-keyboard',
    isOpen: true,
    images: galleryImages,
    totalCount: galleryImages.length,
    hasMore: false,
    isLoadingMore: false,
    onLoadMore: fn(),
    onClose: fn(),
    initialIndex: 0,
    initialView: 'grid',
    detailEntrySource: 'gallery',
  },
  argTypes: {
    onLoadMore: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products/keyboard/arc-one-mechanical-keyboard',
      },
    },
  },
} satisfies Meta<typeof ReviewGalleryModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DetailView: Story = {
  name: 'Detail View',
  args: {
    initialView: 'detail',
  },
};

export const NoImages: Story = {
  name: 'No Images',
  args: {
    images: [],
    totalCount: 0,
  },
};

export const LoadingMore: Story = {
  name: 'Loading More',
  args: {
    totalCount: 8,
    hasMore: true,
    isLoadingMore: true,
  },
};

export const NavigateReviews: Story = {
  name: 'Navigate Reviews',
  args: {
    initialView: 'detail',
  },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText('A clean compact setup'),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', {
        name: /다음 상품평|Next review/,
      }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByText('Comfortable for long sessions'),
      ).toBeVisible();
      await expect(
        canvas.queryByText('A clean compact setup'),
      ).not.toBeInTheDocument();
    });
  },
};
