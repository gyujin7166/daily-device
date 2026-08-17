import { expect, userEvent } from 'storybook/test';

import type { HomeSection } from '@entities/home/model/types';

import HomeCategoryCarousel from './HomeCategoryCarousel';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const imageSrc = '/images/storybook/category-mice.webp';

const sampleSection: HomeSection = {
  id: 1,
  key: 'category',
  eyebrow: 'SHOP BY CATEGORY',
  title: 'Find your daily setup',
  subtitle: 'Explore devices organized for work, play, and everyday use.',
  displayOrder: 1,
  items: Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    label: `Category ${index + 1}`,
    title: `Category ${index + 1}`,
    description: null,
    cta: 'Explore',
    href: '/products',
    image_url: imageSrc,
    imageAlt: `Category ${index + 1}`,
    displayOrder: index + 1,
    layoutGroup: Math.floor(index / 4) + 1,
    layoutGroupClassName: null,
    layoutAreaClassName: null,
    labelPosition: index % 2 === 0 ? 'bottom' : 'top',
    imageClassName: null,
  })),
};

const meta = {
  title: 'Features/Home/HomeCategoryCarousel',
  component: HomeCategoryCarousel,
  tags: ['autodocs'],
  args: {
    section: sampleSection,
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof HomeCategoryCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GoToNextSlide: Story = {
  name: 'Go To Next Slide',
  play: async ({ canvas }) => {
    const secondSlideButton = await canvas.findByRole('button', {
      name: /2번 카테고리 슬라이드로 이동|Go to category slide 2/,
    });

    await userEvent.click(secondSlideButton);
    await expect(secondSlideButton).toHaveAttribute('aria-current', 'true');
  },
};
