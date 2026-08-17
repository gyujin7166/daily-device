import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import ProductFilter from './ProductFilter';

import type { ProductFilterCheckboxStates } from '../model/productFilter';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type ProductFilterProps = ComponentProps<typeof ProductFilter>;

const filterItems = [
  {
    id: 1,
    name: 'Product line',
    filterOption: [
      { id: 11, name_ko: '데일리 라인', name_en: 'daily-line' },
      { id: 12, name_ko: '프로 라인', name_en: 'pro-line' },
    ],
  },
  {
    id: 2,
    name: 'Connection',
    filterOption: [
      { id: 21, name_ko: '블루투스', name_en: 'bluetooth' },
      { id: 22, name_ko: 'USB-C', name_en: 'usb-c' },
    ],
  },
] as ProductFilterProps['filterItems'];

const colorOptions: NonNullable<ProductFilterProps['colorOptions']> = [
  { id: 101, name: 'Graphite', hex: '#343a40' },
  { id: 102, name: 'Cloud', hex: '#e9ecef' },
  { id: 103, name: 'Mint', hex: '#63e6be' },
];

function ProductFilterPreview({
  checkboxStatesOverride = {},
  selectedColorIds = [],
  priceValue = {},
  onCheckboxStatesChange,
  onColorChange,
  onPriceChange,
  ...props
}: ProductFilterProps) {
  const [checkboxStates, setCheckboxStates] =
    useState<ProductFilterCheckboxStates>(checkboxStatesOverride);
  const [colors, setColors] = useState(selectedColorIds);
  const [price, setPrice] = useState(priceValue);

  useEffect(() => {
    setCheckboxStates(checkboxStatesOverride);
  }, [checkboxStatesOverride]);

  useEffect(() => {
    setColors(selectedColorIds);
  }, [selectedColorIds]);

  useEffect(() => {
    setPrice(priceValue);
  }, [priceValue]);

  return (
    <ProductFilter
      {...props}
      checkboxStatesOverride={checkboxStates}
      onCheckboxStatesChange={(nextValue) => {
        setCheckboxStates(nextValue);
        onCheckboxStatesChange?.(nextValue);
      }}
      selectedColorIds={colors}
      onColorChange={(nextColorIds) => {
        setColors(nextColorIds);
        onColorChange?.(nextColorIds);
      }}
      priceValue={price}
      onPriceChange={(nextValue) => {
        setPrice(nextValue);
        onPriceChange?.(nextValue);
      }}
      syncQueryOnChange={false}
    />
  );
}

const meta = {
  title: 'Features/ProductFilter/ProductFilter',
  component: ProductFilter,
  tags: ['autodocs'],
  args: {
    filterItems,
    filterIsPending: false,
    variant: 'default',
    checkboxStatesOverride: {},
    priceRange: { minPrice: 0, maxPrice: 500000 },
    priceValue: {},
    colorOptions,
    selectedColorIds: [],
    onCheckboxStatesChange: fn(),
    onPriceChange: fn(),
    onColorChange: fn(),
    onQueryChange: fn(),
    syncQueryOnChange: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['default', 'drawer'],
    },
    onCheckboxStatesChange: { control: false, table: { disable: true } },
    onPriceChange: { control: false, table: { disable: true } },
    onColorChange: { control: false, table: { disable: true } },
    onQueryChange: { control: false, table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/products' },
    },
  },
  render: (args) => <ProductFilterPreview {...args} />,
} satisfies Meta<typeof ProductFilter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    filterIsPending: true,
  },
};

export const Drawer: Story = {
  args: {
    variant: 'drawer',
  },
  decorators: [
    (Story) => (
      <div className="rounded-2xl bg-surface p-5 shadow-lg dark:bg-dark-panel">
        <Story />
      </div>
    ),
  ],
};

export const SelectFilters: Story = {
  name: 'Select Filters',
  play: async ({ canvas }) => {
    const dailyLineCheckbox = canvas.getByRole('checkbox', {
      name: '데일리 라인',
    });
    const bluetoothCheckbox = canvas.getByRole('checkbox', {
      name: '블루투스',
    });
    const graphiteButton = canvas.getByRole('button', { name: 'Graphite' });

    await userEvent.click(dailyLineCheckbox);
    await userEvent.click(bluetoothCheckbox);
    await userEvent.click(graphiteButton);

    await expect(dailyLineCheckbox).toBeChecked();
    await expect(bluetoothCheckbox).toBeChecked();
    await expect(graphiteButton).toHaveAttribute('aria-pressed', 'true');
  },
};
