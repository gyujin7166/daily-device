import { delay, HttpResponse, http } from 'msw';
import { expect, userEvent, waitFor } from 'storybook/test';

import type { ProductSortOption } from '@entities/product/model/sort';
import type { CatalogProductItem } from '@entities/product/model/types';

import ProductAllContentContainer from './ProductAllContentContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const PRODUCT_IMAGE_SRC = '/images/storybook/featured-breeze-mouse-desk.webp';

const createCatalogProduct = ({
  id,
  name,
  category,
  price,
  originalPrice = price,
}: {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
}): CatalogProductItem => {
  const isDiscounted = originalPrice > price;
  const discountRate = isDiscounted
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return {
    id,
    name_en: name,
    slug: name.toLowerCase().replaceAll(' ', '-'),
    description: 'A practical device designed for a clean daily workspace.',
    productLine: 'EVERYDAY_LINE',
    price,
    originalPrice,
    discountedPrice: price,
    discountRate,
    isDiscounted,
    priceLabel: `${price.toLocaleString('ko-KR')}원`,
    originalPriceLabel: `${originalPrice.toLocaleString('ko-KR')}원`,
    discountedPriceLabel: `${price.toLocaleString('ko-KR')}원`,
    category: {
      id,
      name_en: category,
      name_ko: category,
      slug: category.toLowerCase(),
      parentId: null,
      displayOrder: id,
      image_url: null,
      isVisible: true,
    },
    filter: [],
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
  };
};

const catalogProducts = [
  createCatalogProduct({
    id: 101,
    name: 'Arc One Mechanical Keyboard',
    category: 'Keyboards',
    price: 189000,
  }),
  createCatalogProduct({
    id: 102,
    name: 'Daily Device Wireless Mouse',
    category: 'Mice',
    price: 59000,
    originalPrice: 79000,
  }),
  createCatalogProduct({
    id: 103,
    name: 'Frame Studio Monitor',
    category: 'Monitors',
    price: 329000,
  }),
  createCatalogProduct({
    id: 104,
    name: 'Daily Device Full HD Webcam',
    category: 'Webcams',
    price: 129000,
    originalPrice: 159000,
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

const productsHandler = http.get('*/api/products', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const sort = (searchParams.get('sort') ?? 'relevance') as ProductSortOption;
  const discountedOnly = searchParams.get('discounted') === 'true';
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 12);
  const availableProducts = discountedOnly
    ? catalogProducts.filter((product) => product.isDiscounted)
    : catalogProducts;
  const sortedProducts = sortProducts(availableProducts, sort);
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
    limit: Number(searchParams.get('limit') ?? 12),
    hasMore: false,
  });
});

const loadingProductsHandler = http.get('*/api/products', async () => {
  await delay('infinite');

  return HttpResponse.json({
    items: [],
    total: 0,
    page: 1,
    limit: 12,
    hasMore: false,
  });
});

const meta = {
  title: 'Pages/Products/ProductAllContentContainer',
  component: ProductAllContentContainer,
  tags: ['autodocs'],
  args: {
    discountedOnly: false,
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/products',
      },
    },
  },
} satisfies Meta<typeof ProductAllContentContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [productsHandler],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [emptyProductsHandler],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [loadingProductsHandler],
    },
  },
};

export const SortProducts: Story = {
  name: 'Sort Products',
  parameters: {
    msw: {
      handlers: [productsHandler],
    },
  },
  play: async ({ canvas }) => {
    await canvas.findByRole('heading', {
      name: 'Arc One Mechanical Keyboard',
    });
    await userEvent.click(
      canvas.getByRole('button', {
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

export const DiscountedProducts: Story = {
  name: 'Discounted Products',
  args: {
    discountedOnly: true,
  },
  parameters: {
    msw: {
      handlers: [productsHandler],
    },
  },
};
