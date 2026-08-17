import { HttpResponse, http } from 'msw';

import type { HomeSection } from '@entities/home/model/types';
import type { HeroSummaryItem } from '@entities/product/model/types';

import HomePageContent from './HomePageContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const heroImageSrc = '/images/storybook/hero-pixel-keys-flow.webp';
const featuredImageSrc = '/images/storybook/featured-breeze-mouse-desk.webp';
const categoryImageSrc = '/images/storybook/category-mice.webp';

const lightTextHero: HeroSummaryItem = {
  id: 1,
  name_en: 'Daily Device Main Hero',
  name_ko: '데일리 디바이스 메인 히어로',
  description: 'Devices for every part of your day',
  detailed_description:
    'Build a comfortable setup for work, play, and everything in between.',
  position: 'start',
  image_url: heroImageSrc,
  textTone: 'light',
  navTone: 'light',
  overlayTone: 'dark',
};

const featuredSection: HomeSection = {
  id: 1,
  key: 'featured-products',
  eyebrow: 'FEATURED DEVICES',
  title: 'Build your daily setup',
  subtitle: 'Discover devices selected for work, play, and everyday use.',
  displayOrder: 1,
  items: [
    {
      id: 101,
      label: 'DAILY WORKSPACE',
      title: 'Arc One Mechanical Keyboard',
      description: 'A compact wireless keyboard for a clean daily setup.',
      cta: 'View product',
      href: '/products/keyboards/arc-one-mechanical-keyboard',
      image_url: '/images/storybook/featured-nook-keys-core.webp',
      imageAlt: 'Arc One Mechanical Keyboard',
      displayOrder: 1,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
    {
      id: 102,
      label: 'CREATOR PICK',
      title: 'Daily Device Full HD Webcam',
      description: 'A Full HD webcam for meetings and streaming.',
      cta: 'View product',
      href: '/products/webcams/daily-device-full-hd-webcam',
      image_url: '/images/storybook/featured-aster-webcam-mini.webp',
      imageAlt: 'Daily Device Full HD Webcam',
      displayOrder: 2,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
    {
      id: 103,
      label: 'EVERYDAY ESSENTIAL',
      title: 'Daily Device Wireless Mouse',
      description: 'A lightweight wireless mouse for everyday productivity.',
      cta: 'View product',
      href: '/products/mice/daily-device-wireless-mouse',
      image_url: featuredImageSrc,
      imageAlt: 'Daily Device Wireless Mouse',
      displayOrder: 3,
      layoutGroup: 1,
      layoutGroupClassName: null,
      layoutAreaClassName: null,
      labelPosition: null,
      imageClassName: null,
    },
  ],
};

const categoryCarouselSection: HomeSection = {
  id: 2,
  key: 'category-carousel',
  eyebrow: 'SHOP BY CATEGORY',
  title: 'Find your daily setup',
  subtitle: 'Explore devices organized for your everyday needs.',
  displayOrder: 2,
  items: Array.from({ length: 8 }, (_, index) => ({
    id: 201 + index,
    label: `Category ${index + 1}`,
    title: `Category ${index + 1}`,
    description: null,
    cta: 'Explore',
    href: '/products',
    image_url: categoryImageSrc,
    imageAlt: `Category ${index + 1}`,
    displayOrder: index + 1,
    layoutGroup: Math.floor(index / 4) + 1,
    layoutGroupClassName: null,
    layoutAreaClassName: null,
    labelPosition: index % 2 === 0 ? 'bottom' : 'top',
    imageClassName: null,
  })),
};

const createHeroHandler = (hero: HeroSummaryItem) =>
  http.get('*/api/products/hero', () =>
    HttpResponse.json({ items: [hero], message: 'Success' }),
  );

const createHomeSectionsHandler = (sections: HomeSection[]) =>
  http.get('*/api/home/sections', () =>
    HttpResponse.json({ items: sections, message: 'Success' }),
  );

const completeHomeHandlers = [
  createHeroHandler(lightTextHero),
  createHomeSectionsHandler([featuredSection, categoryCarouselSection]),
];

const meta = {
  title: 'Pages/Home/HomePageContent',
  component: HomePageContent,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
} satisfies Meta<typeof HomePageContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: completeHomeHandlers,
    },
  },
};

export const DarkTextHero: Story = {
  name: 'Dark Text Hero',
  parameters: {
    msw: {
      handlers: [
        createHeroHandler({
          ...lightTextHero,
          id: 2,
          description: 'A brighter space for focused work',
          textTone: 'dark',
          navTone: 'dark',
          overlayTone: 'light',
        }),
        createHomeSectionsHandler([featuredSection, categoryCarouselSection]),
      ],
    },
  },
};

export const HeroOnly: Story = {
  name: 'Hero Only',
  parameters: {
    msw: {
      handlers: [
        createHeroHandler(lightTextHero),
        createHomeSectionsHandler([]),
      ],
    },
  },
};
