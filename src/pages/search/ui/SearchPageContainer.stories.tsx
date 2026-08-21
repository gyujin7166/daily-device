import { delay, HttpResponse, http } from 'msw';
import { expect, userEvent, waitFor } from 'storybook/test';

import type {
  SearchResultItem,
  SearchSortOption,
} from '@features/search/model/types';

import SearchPageContainer from './SearchPageContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const searchResults: SearchResultItem[] = [
  {
    id: 101,
    name_en: 'Arc One Mechanical Keyboard',
    name_ko: '아크 원 기계식 키보드',
    slug: 'arc-one-mechanical-keyboard',
    description: 'A compact wireless keyboard for a clean daily setup.',
    productLine: null,
    price: 189000,
    priceLabel: '189,000원',
    ProductImage: [
      {
        image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
        isMain: true,
        productColorId: 201,
        order: 0,
      },
    ],
    category: {
      name_en: 'Keyboards',
      slug: 'keyboards',
    },
    productColor: [
      {
        id: 201,
        isDefault: true,
        color: { name: 'Graphite', hex: '#343a40' },
      },
    ],
  },
  {
    id: 102,
    name_en: 'Daily Device Wireless Mouse',
    name_ko: '데일리 디바이스 무선 마우스',
    slug: 'daily-device-wireless-mouse',
    description: 'A lightweight wireless mouse for everyday productivity.',
    productLine: null,
    price: 59000,
    priceLabel: '59,000원',
    ProductImage: [
      {
        image_url: '/images/storybook/featured-nook-keys-core.webp',
        isMain: true,
        productColorId: 202,
        order: 0,
      },
    ],
    category: {
      name_en: 'Mice',
      slug: 'mice',
    },
    productColor: [
      {
        id: 202,
        isDefault: true,
        color: { name: 'Cloud', hex: '#e9ecef' },
      },
    ],
  },
  {
    id: 103,
    name_en: 'Daily Device Full HD Webcam',
    name_ko: '데일리 디바이스 풀 HD 웹캠',
    slug: 'daily-device-full-hd-webcam',
    description: 'A Full HD webcam for meetings and streaming.',
    productLine: null,
    price: 129000,
    priceLabel: '129,000원',
    ProductImage: [
      {
        image_url: '/images/storybook/featured-aster-webcam-mini.webp',
        isMain: true,
        productColorId: 203,
        order: 0,
      },
    ],
    category: {
      name_en: 'Webcams',
      slug: 'webcams',
    },
    productColor: [
      {
        id: 203,
        isDefault: true,
        color: { name: 'Black', hex: '#111827' },
      },
    ],
  },
];

const availableCategories = ['keyboards', 'mice', 'webcams'];

const sortSearchResults = (
  items: SearchResultItem[],
  sort: SearchSortOption,
) => {
  const sortedItems = [...items];

  switch (sort) {
    case 'name_asc':
      return sortedItems.sort((first, second) =>
        first.name_en.localeCompare(second.name_en),
      );
    case 'name_desc':
      return sortedItems.sort((first, second) =>
        second.name_en.localeCompare(first.name_en),
      );
    case 'price_asc':
      return sortedItems.sort((first, second) => first.price - second.price);
    case 'price_desc':
      return sortedItems.sort((first, second) => second.price - first.price);
    case 'relevance':
    default:
      return sortedItems;
  }
};

const searchResultsHandler = http.get('*/api/search/results', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const categories =
    searchParams.get('categories')?.split(',').filter(Boolean) ?? [];
  const sort = (searchParams.get('sort') ?? 'relevance') as SearchSortOption;
  const filteredItems = categories.length
    ? searchResults.filter((item) => categories.includes(item.category.slug))
    : searchResults;
  const items = sortSearchResults(filteredItems, sort);

  return HttpResponse.json({
    items,
    total: items.length,
    baseTotal: searchResults.length,
    page: 1,
    limit: 12,
    hasMore: false,
    availableCategories,
  });
});

const emptySearchResultsHandler = http.get('*/api/search/results', () =>
  HttpResponse.json({
    items: [],
    total: 0,
    baseTotal: 0,
    page: 1,
    limit: 12,
    hasMore: false,
    availableCategories: [],
  }),
);

const loadingSearchResultsHandler = http.get(
  '*/api/search/results',
  async () => {
    await delay('infinite');

    return HttpResponse.json({
      items: [],
      total: 0,
      baseTotal: 0,
      page: 1,
      limit: 12,
      hasMore: false,
      availableCategories: [],
    });
  },
);

const meta = {
  title: 'Pages/Search/SearchPageContainer',
  component: SearchPageContainer,
  tags: ['autodocs'],
  args: {
    query: 'device',
  },
  decorators: [
    (Story) => (
      <main className="min-h-screen">
        <Story />
      </main>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/search',
        query: { query: 'device' },
      },
    },
  },
} satisfies Meta<typeof SearchPageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [searchResultsHandler],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingSearchResultsHandler],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [emptySearchResultsHandler],
    },
  },
};

export const FilterByCategory: Story = {
  name: 'Filter by Category',
  parameters: {
    msw: {
      handlers: [searchResultsHandler],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', { name: /마우스|Mice/i }),
    );

    await waitFor(async () => {
      await expect(
        canvas.getByRole('heading', {
          name: 'Daily Device Wireless Mouse',
        }),
      ).toBeVisible();
      await expect(
        canvas.queryByRole('heading', {
          name: 'Arc One Mechanical Keyboard',
        }),
      ).not.toBeInTheDocument();
    });
  },
};

export const SortResults: Story = {
  name: 'Sort Results',
  parameters: {
    msw: {
      handlers: [searchResultsHandler],
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /정렬 변경|Change Sort/i,
      }),
    );
    await userEvent.click(
      canvas.getByRole('option', {
        name: /가격 낮은순|Price low to high/i,
      }),
    );

    await waitFor(async () => {
      const productHeadings = canvas.getAllByRole('heading', { level: 2 });

      await expect(productHeadings[0]).toHaveTextContent(
        'Daily Device Wireless Mouse',
      );
    });
  },
};
