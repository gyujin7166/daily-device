import { delay, HttpResponse, http } from 'msw';
import { expect, userEvent, waitFor } from 'storybook/test';

import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductItem,
  FilterWithOptions,
  ProductColorFilterOption,
} from '@entities/product/model/types';

import ProductCategoryContentContainer from './ProductCategoryContentContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const PRODUCT_IMAGE_SRC = '/images/storybook/featured-breeze-mouse-desk.webp';

const filterItems: FilterWithOptions[] = [
  {
    id: 1,
    name: 'Product line',
    categoryName: 'keyboards',
    filterOption: [
      {
        id: 11,
        filterId: 1,
        name_ko: '데일리 라인',
        name_en: 'daily-line',
        categoryName: 'keyboards',
      },
      {
        id: 12,
        filterId: 1,
        name_ko: '프로 라인',
        name_en: 'pro-line',
        categoryName: 'keyboards',
      },
      {
        id: 13,
        filterId: 1,
        name_ko: '크리에이터 라인',
        name_en: 'creator-line',
        categoryName: 'keyboards',
      },
    ],
  },
  {
    id: 2,
    name: 'Connection',
    categoryName: 'keyboards',
    filterOption: [
      {
        id: 21,
        filterId: 2,
        name_ko: '블루투스',
        name_en: 'bluetooth',
        categoryName: 'keyboards',
      },
      {
        id: 22,
        filterId: 2,
        name_ko: 'USB-C',
        name_en: 'usb-c',
        categoryName: 'keyboards',
      },
    ],
  },
];

const colorOptions: ProductColorFilterOption[] = [
  { id: 101, name: 'Graphite', hex: '#343a40' },
  { id: 102, name: 'Cloud', hex: '#e9ecef' },
];

const createCatalogProduct = ({
  id,
  name,
  price,
  productLineOptionId,
  connectionOptionId,
}: {
  id: number;
  name: string;
  price: number;
  productLineOptionId: number;
  connectionOptionId: number;
}): CatalogProductItem => ({
  id,
  name_en: name,
  slug: name.toLowerCase().replaceAll(' ', '-'),
  description: 'A practical keyboard designed for a clean daily workspace.',
  productLine: 'EVERYDAY_LINE',
  price,
  originalPrice: price,
  discountedPrice: price,
  discountRate: 0,
  isDiscounted: false,
  priceLabel: `${price.toLocaleString('ko-KR')}원`,
  originalPriceLabel: `${price.toLocaleString('ko-KR')}원`,
  discountedPriceLabel: `${price.toLocaleString('ko-KR')}원`,
  category: {
    id: 1,
    name_en: 'Keyboards',
    name_ko: '키보드',
    slug: 'keyboards',
    parentId: null,
    displayOrder: 1,
    image_url: null,
    isVisible: true,
  },
  filter: [
    {
      '1': [productLineOptionId],
      '2': [connectionOptionId],
    },
  ],
  ProductImage: [
    {
      image_url: PRODUCT_IMAGE_SRC,
      isMain: true,
      productColorId: id,
      order: 0,
    },
  ],
  productColor: [
    {
      id,
      isDefault: true,
      color: {
        name: 'Graphite',
        hex: '#343a40',
      },
    },
  ],
});

const products = [
  createCatalogProduct({
    id: 201,
    name: 'Arc One Mechanical Keyboard',
    price: 189000,
    productLineOptionId: 11,
    connectionOptionId: 22,
  }),
  createCatalogProduct({
    id: 202,
    name: 'Daily Compact Keyboard',
    price: 99000,
    productLineOptionId: 11,
    connectionOptionId: 21,
  }),
  createCatalogProduct({
    id: 203,
    name: 'Pro Performance Keyboard',
    price: 249000,
    productLineOptionId: 12,
    connectionOptionId: 22,
  }),
  createCatalogProduct({
    id: 204,
    name: 'Pro Wireless Keyboard',
    price: 219000,
    productLineOptionId: 12,
    connectionOptionId: 21,
  }),
];

const optionNameToId = new Map(
  filterItems.flatMap((filter) =>
    filter.filterOption.map((option) => [option.name_en, option.id] as const),
  ),
);

const sortProducts = (items: CatalogProductItem[], sort: ProductSortOption) => {
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

const filterProducts = (
  items: CatalogProductItem[],
  selectedFilterNames: string[],
) => {
  const selectedIds = selectedFilterNames.flatMap((name) => {
    const optionId = optionNameToId.get(name);

    return optionId ? [optionId] : [];
  });

  if (selectedFilterNames.length > 0 && selectedIds.length === 0) {
    return [];
  }

  return items.filter((product) =>
    selectedIds.every((optionId) =>
      Object.values(product.filter[0] ?? {}).some((values) =>
        values.includes(optionId),
      ),
    ),
  );
};

const filtersHandler = http.get('*/api/products/filters', () =>
  HttpResponse.json({ items: filterItems, message: 'Success' }),
);

const productsHandler = http.get('*/api/products', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const selectedFilterNames =
    searchParams.get('filters')?.split(',').filter(Boolean) ?? [];
  const sort = (searchParams.get('sort') ?? 'relevance') as ProductSortOption;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 6);
  const filteredProducts = filterProducts(products, selectedFilterNames);
  const sortedProducts = sortProducts(filteredProducts, sort);
  const startIndex = (page - 1) * limit;
  const items = sortedProducts.slice(startIndex, startIndex + limit);

  return HttpResponse.json({
    items,
    total: sortedProducts.length,
    page,
    limit,
    hasMore: startIndex + items.length < sortedProducts.length,
  });
});

const loadingFiltersHandler = http.get('*/api/products/filters', async () => {
  await delay('infinite');

  return HttpResponse.json({ items: [], message: 'Success' });
});

const loadingProductsHandler = http.get('*/api/products', async () => {
  await delay('infinite');

  return HttpResponse.json({
    items: [],
    total: 0,
    page: 1,
    limit: 6,
    hasMore: false,
  });
});

const completeHandlers = [filtersHandler, productsHandler];

const meta = {
  title: 'Pages/Products/ProductCategoryContentContainer',
  component: ProductCategoryContentContainer,
  tags: ['autodocs'],
  args: {
    category: 'keyboards',
    priceRange: {
      minPrice: 0,
      maxPrice: 400000,
    },
    colorOptions,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products/keyboards',
      },
    },
  },
} satisfies Meta<typeof ProductCategoryContentContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: completeHandlers,
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingFiltersHandler, loadingProductsHandler],
    },
  },
};

export const HideFilters: Story = {
  name: 'Hide Filters',
  parameters: {
    msw: {
      handlers: completeHandlers,
    },
  },
  play: async ({ canvas }) => {
    const hideFilterButton = await canvas.findByRole('button', {
      name: /필터 숨기기|Hide filters/i,
    });

    await userEvent.click(hideFilterButton);
    await expect(
      canvas.getByRole('button', {
        name: /필터 표시|Show filters/i,
      }),
    ).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.queryByRole('checkbox', { name: /데일리 라인/i }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const FilteredProducts: Story = {
  name: 'Filtered Products',
  parameters: {
    msw: {
      handlers: completeHandlers,
    },
    nextjs: {
      navigation: {
        pathname: '/products/keyboards',
        query: {
          filters: 'daily-line',
        },
      },
    },
  },
};

export const EmptyFilterResults: Story = {
  name: 'Empty Filter Results',
  parameters: {
    msw: {
      handlers: completeHandlers,
    },
    nextjs: {
      navigation: {
        pathname: '/products/keyboards',
        query: {
          filters: 'creator-line',
        },
      },
    },
  },
};

export const OpenMobileFilters: Story = {
  name: 'Open Mobile Filters',
  globals: {
    viewport: { value: 'mobile2', isRotated: false },
  },
  parameters: {
    msw: {
      handlers: completeHandlers,
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /필터 표시|Show filters/i,
      }),
    );

    await expect(
      canvas.getByRole('heading', { level: 2, name: /필터|Filter/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: /적용하기|Apply/i }),
    ).toBeVisible();
  },
};
