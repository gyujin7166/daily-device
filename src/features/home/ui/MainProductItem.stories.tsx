import { expect } from 'storybook/test';

import type { HomeSection } from '@entities/home/model/types';

import MainProductItem from './MainProductItem';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const imageSrc = '/images/storybook/featured-breeze-mouse-desk.webp';

const sampleSection: HomeSection = {
  id: 1,
  key: 'featured-products',
  eyebrow: 'FEATURED DEVICES',
  title: 'Build your daily setup',
  subtitle: 'Discover devices selected for work, play, and everyday use.',
  displayOrder: 1,
  items: [
    {
      id: 101,
      label: 'EVERYDAY ESSENTIAL',
      title: 'Daily Device Wireless Mouse',
      description: 'A lightweight wireless mouse for everyday productivity.',
      cta: 'View product',
      href: '/products/mice/daily-device-wireless-mouse',
      image_url: imageSrc,
      imageAlt: 'Daily Device Wireless Mouse',
      displayOrder: 3,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
    {
      id: 102,
      label: 'DAILY WORKSPACE',
      title: 'Arc One Mechanical Keyboard',
      description: 'A compact wireless keyboard for a clean daily setup.',
      cta: 'View product',
      href: '/products/keyboards/arc-one-mechanical-keyboard',
      image_url: imageSrc,
      imageAlt: 'Arc One Mechanical Keyboard',
      displayOrder: 1,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
    {
      id: 103,
      label: 'CREATOR PICK',
      title: 'Daily Device Full HD Webcam',
      description: 'A Full HD webcam for meetings and streaming.',
      cta: 'View product',
      href: '/products/webcams/daily-device-full-hd-webcam',
      image_url: imageSrc,
      imageAlt: 'Daily Device Full HD Webcam',
      displayOrder: 2,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
  ],
};

const meta = {
  title: 'Features/Home/MainProductItem',
  component: MainProductItem,
  tags: ['autodocs'],
  args: {
    section: sampleSection,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
} satisfies Meta<typeof MainProductItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const productHeadings = canvas.getAllByRole('heading', { level: 3 });

    await expect(productHeadings[0]).toHaveTextContent(
      'Arc One Mechanical Keyboard',
    );
    await expect(productHeadings[1]).toHaveTextContent(
      'Daily Device Full HD Webcam',
    );
    await expect(productHeadings[2]).toHaveTextContent(
      'Daily Device Wireless Mouse',
    );
  },
};

export const SingleItem: Story = {
  name: 'Single Item',
  args: {
    section: {
      ...sampleSection,
      items: sampleSection.items.slice(0, 1),
    },
  },
};

export const MissingImage: Story = {
  name: 'Missing Image',
  args: {
    section: {
      ...sampleSection,
      items: [
        {
          ...sampleSection.items[0],
          id: 104,
          title: 'Fallback Image Product',
          image_url: '',
          imageAlt: 'Fallback product preview',
          displayOrder: 1,
        },
      ],
    },
  },
};
