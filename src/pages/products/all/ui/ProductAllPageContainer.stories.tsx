import { delay, HttpResponse, http } from 'msw';

import type { ProductSortOption } from '@entities/product/model/sort';
import type {
  CatalogProductItem,
  HeroSummaryItem,
} from '@entities/product/model/types';

import ProductAllPageContainer from './ProductAllPageContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const IMAGE_SRC = '/images/storybook/featured-breeze-mouse-desk.webp';

const allProductsHero: HeroSummaryItem = {
  id: 1,
  name_en: 'All products',
  name_ko: '전체 상품',
  description:
    'Browse Daily Device essentials for work, play, and everyday use.',
  detailed_description: null,
  position: 'center',
  image_url: IMAGE_SRC,
  textTone: 'dark',
  navTone: 'dark',
  overlayTone: 'light',
};

const discountedProductsHero: HeroSummaryItem = {
  ...allProductsHero,
  id: 2,
  name_en: 'Special offers',
  name_ko: '특가 상품',
  description: 'Discover discounted Daily Device products in one place.',
};

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
  };
};

const products = [
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

const heroHandler = http.get('*/api/products/hero', ({ request }) => {
  const type = new URL(request.url).searchParams.get('type');
  const hero =
    type === 'product-discounts' ? discountedProductsHero : allProductsHero;

  return HttpResponse.json({ items: [hero], message: 'Success' });
});

const productsHandler = http.get('*/api/products', ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const sort = (searchParams.get('sort') ?? 'relevance') as ProductSortOption;
  const discountedOnly = searchParams.get('discounted') === 'true';
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 12);
  const availableProducts = discountedOnly
    ? products.filter((product) => product.isDiscounted)
    : products;
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
  title: 'Pages/Products/ProductAllPageContainer',
  component: ProductAllPageContainer,
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
} satisfies Meta<typeof ProductAllPageContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllProducts: Story = {
  name: 'All Products',
  parameters: {
    msw: {
      handlers: [heroHandler, productsHandler],
    },
  },
};

export const DiscountedProducts: Story = {
  name: 'Discounted Products',
  args: {
    discountedOnly: true,
  },
  parameters: {
    msw: {
      handlers: [heroHandler, productsHandler],
    },
    nextjs: {
      navigation: {
        pathname: '/products/discounts',
      },
    },
  },
};

export const LoadingProducts: Story = {
  name: 'Loading Products',
  parameters: {
    msw: {
      handlers: [heroHandler, loadingProductsHandler],
    },
  },
};
