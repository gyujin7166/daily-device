import { HttpResponse, http } from 'msw';
import { expect, userEvent, waitFor } from 'storybook/test';

import type { CategoryItems } from '@entities/category/model/types';

import Hero from '@shared/ui/Hero/Hero';

import NavBar from './NavBar';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const categories: CategoryItems[] = [
  {
    id: 1,
    name_en: 'Computer',
    name_ko: '컴퓨터',
    slug: 'computer',
    image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
    displayOrder: 1,
    children: [
      {
        id: 11,
        name_en: 'Keyboard',
        name_ko: '키보드',
        slug: 'keyboard',
        displayOrder: 1,
      },
      {
        id: 12,
        name_en: 'Mouse',
        name_ko: '마우스',
        slug: 'mouse',
        displayOrder: 2,
      },
    ],
  },
];

const navigationHandlers = [
  http.get('*/api/products/categories', () =>
    HttpResponse.json({ items: categories }),
  ),
  http.get('*/api/search/suggestions', () => HttpResponse.json({ items: [] })),
];

const searchSuggestionHandlers = [
  navigationHandlers[0],
  http.get('*/api/search/suggestions', ({ request }) => {
    const keyword = new URL(request.url).searchParams.get('keyword') ?? '';
    const items = keyword.trim()
      ? [
          {
            id: 101,
            name_en: 'Arc One Mechanical Keyboard',
            name_ko: '아크 원 기계식 키보드',
            slug: 'arc-one-mechanical-keyboard',
          },
          {
            id: 102,
            name_en: 'Arc Mini Wireless Keyboard',
            name_ko: '아크 미니 무선 키보드',
            slug: 'arc-mini-wireless-keyboard',
          },
        ]
      : [];

    return HttpResponse.json({ items });
  }),
];

function NavigationHeroPreview({ tone }: { tone: 'dark' | 'light' }) {
  const usesDarkHero = tone === 'light';

  return (
    <div className="-m-6 min-h-[140vh]">
      <NavBar />
      <Hero
        minHeight={72}
        imagesSet={[
          {
            id: 'navigation-hero-preview',
            image_url: '/images/storybook/hero-pixel-keys-flow.webp',
            blurHash: '',
            textTone: usesDarkHero ? 'light' : 'dark',
            navTone: tone,
            overlayTone: 'none',
          },
        ]}
        imageClassName={usesDarkHero ? 'brightness-0' : 'brightness-0 invert'}
        contentWidth="1/2"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
          Daily Device
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-6xl">
          Navigation over a hero
        </h1>
      </Hero>
      <div className="min-h-[68vh] bg-canvas p-10 dark:bg-dark-bg">
        <p className="text-muted dark:text-dark-muted">
          Scroll content below the hero.
        </p>
      </div>
    </div>
  );
}

const meta = {
  title: 'Widgets/Navigation/NavBar',
  component: NavBar,
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
    msw: {
      handlers: navigationHandlers,
    },
  },
} satisfies Meta<typeof NavBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DarkHeroOverlay: Story = {
  name: 'Dark Hero Overlay',
  render: () => <NavigationHeroPreview tone="light" />,
};

export const LightHeroOverlay: Story = {
  name: 'Light Hero Overlay',
  render: () => <NavigationHeroPreview tone="dark" />,
};

export const OpenSearch: Story = {
  name: 'Open Search',
  render: () => <NavigationHeroPreview tone="light" />,
  play: async ({ canvas }) => {
    const searchButton = canvas.getByRole('button', {
      name: /검색|Search/,
    });

    await userEvent.click(searchButton);
    await waitFor(async () => {
      await expect(canvas.getByRole('textbox')).toBeVisible();
    });
    await expect(searchButton).toHaveAttribute('aria-pressed', 'true');
  },
};

export const ShowSearchSuggestions: Story = {
  name: 'Show Search Suggestions',
  render: () => <NavigationHeroPreview tone="light" />,
  parameters: {
    msw: {
      handlers: searchSuggestionHandlers,
    },
  },
  play: async ({ canvas }) => {
    const searchButton = canvas.getByRole('button', {
      name: /검색|Search/,
    });

    await userEvent.click(searchButton);
    const searchInput = await canvas.findByRole('textbox');
    await userEvent.type(searchInput, 'arc');

    await waitFor(async () => {
      await expect(
        canvas.getByRole('link', { name: /Arc One Mechanical Keyboard/ }),
      ).toBeVisible();
    });
    await expect(
      canvas.getByRole('link', { name: /Arc Mini Wireless Keyboard/ }),
    ).toBeVisible();
  },
};
