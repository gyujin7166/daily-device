import { expect, userEvent } from 'storybook/test';

import ProductDetailCarousel from './ProductDetailCarousel';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const productItems = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  image_url: '/images/storybook/featured-breeze-mouse-desk.webp',
  alt: `Daily Device Product ${index + 1}`,
  productLine: index % 2 === 0 ? 'Daily Workspace' : 'Mobile Essentials',
  name: `Daily Device Product ${index + 1}`,
  description: 'A practical device selected for an everyday setup.',
  price: 89000 + index * 10000,
  priceLabel: `${(89000 + index * 10000).toLocaleString('ko-KR')}원`,
  href: '/products',
  productColor: [
    {
      id: index * 10 + 1,
      isDefault: true,
      color: { name: 'Graphite', hex: '#343a40' },
    },
    {
      id: index * 10 + 2,
      color: { name: 'Cloud', hex: '#e9ecef' },
    },
  ],
  category: { name_en: 'Device' },
}));

const meta = {
  title: 'Widgets/ProductRecommendation/ProductDetailCarousel',
  component: ProductDetailCarousel,
  tags: ['autodocs'],
  args: {
    items: productItems,
    eyebrow: 'RECOMMENDED',
    title: '추천 상품',
    density: 'default',
  },
  argTypes: {
    density: {
      control: 'inline-radio',
      options: ['default', 'compact'],
    },
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/products/keyboard/sample-product' },
    },
  },
} satisfies Meta<typeof ProductDetailCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    density: 'compact',
    eyebrow: 'FOR YOU',
    title: '이런 상품은 어떠세요?',
  },
};

export const GoToNextSlide: Story = {
  name: 'Go To Next Slide',
  play: async ({ canvas }) => {
    const previousButton = await canvas.findByRole('button', {
      name: /이전 상품|Previous products/,
    });
    const nextButton = canvas.getByRole('button', {
      name: /다음 상품|Next products/,
    });
    const secondPageButton = canvas.getByRole('button', {
      name: /2번 페이지로 이동|Go to page 2/,
    });

    await expect(previousButton).toBeDisabled();
    await expect(secondPageButton).toHaveAttribute('aria-current', 'false');
    await userEvent.click(nextButton);
    await expect(previousButton).toBeEnabled();
    await expect(secondPageButton).toHaveAttribute('aria-current', 'true');
  },
};
