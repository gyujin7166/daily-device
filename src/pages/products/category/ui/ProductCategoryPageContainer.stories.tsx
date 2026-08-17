import { delay, HttpResponse, http } from 'msw';

import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductItem,
  FilterWithOptions,
  HeroSummaryItem,
  ProductColorFilterOption,
} from '@entities/product/model/types';

import ProductCategoryPageContainer from './ProductCategoryPageContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const IMAGE_SRC = '/images/storybook/featured-breeze-mouse-desk.webp';

const categoryHero: HeroSummaryItem = {
  id: 1,
  name_en: 'Keyboards',
  name_ko: '키보드',
  description: 'Find a keyboard that fits your daily workspace.',
  detailed_description: null,
  position: 'start',
  image_url: IMAGE_SRC,
  textTone: 'dark',
  navTone: 'dark',
  overlayTone: 'light',
};

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
}: {
  id: number;
  name: string;
  price: number;
  productLineOptionId: number;
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
  filter: [{ '1': [productLineOptionId] }],
  ProductImage: [
    {
      image_url: IMAGE_SRC,
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
  }),
  createCatalogProduct({
    id: 202,
    name: 'Daily Compact Keyboard',
    price: 99000,
    productLineOptionId: 11,
  }),
  createCatalogProduct({
    id: 203,
    name: 'Pro Performance Keyboard',
    price: 249000,
    productLineOptionId: 12,
  }),
];

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

const heroHandler = http.get('*/api/products/hero', () =>
  HttpResponse.json({ items: [categoryHero], message: 'Success' }),
);

const heroWithoutImageHandler = http.get('*/api/products/hero', () =>
  HttpResponse.json({ items: [], message: 'Success' }),
);

const filtersHandler = http.get('*/api/products/filters', () =>
  HttpResponse.json({ items: filterItems, message: 'Success' }),
);

const productsHandler = http.get('*/api/products', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const sort = (searchParams.get('sort') ?? 'relevance') as ProductSortOption;
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 6);
  const sortedProducts = sortProducts(products, sort);
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

const emptyProductsHandler = http.get('*/api/products', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;

  return HttpResponse.json({
    items: [],
    total: 0,
    page: Number(searchParams.get('page') ?? 1),
    limit: Number(searchParams.get('limit') ?? 6),
    hasMore: false,
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

const meta = {
  title: 'Pages/Products/ProductCategoryPageContainer',
  component: ProductCategoryPageContainer,
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
} satisfies Meta<typeof ProductCategoryPageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [heroHandler, filtersHandler, productsHandler],
    },
  },
};

export const LoadingProducts: Story = {
  name: 'Loading Products',
  parameters: {
    msw: {
      handlers: [heroHandler, loadingFiltersHandler, loadingProductsHandler],
    },
  },
};

export const EmptyCategory: Story = {
  name: 'Empty Category',
  parameters: {
    msw: {
      handlers: [heroHandler, filtersHandler, emptyProductsHandler],
    },
  },
};

export const HeroWithoutImage: Story = {
  name: 'Hero Without Image',
  parameters: {
    msw: {
      handlers: [heroWithoutImageHandler, filtersHandler, productsHandler],
    },
  },
};
