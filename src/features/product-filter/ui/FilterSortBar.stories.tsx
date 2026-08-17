import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import type { ProductSortOption } from '@entities/product/model/sort';

import FilterSortBar from './FilterSortBar';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type FilterSortBarPreviewProps = ComponentProps<typeof FilterSortBar>;

function FilterSortBarPreview({
  visibleFilter: initialVisibleFilter,
  onToggleFilter,
  sortOption: initialSortOption,
  onSortChange,
  ...props
}: FilterSortBarPreviewProps) {
  const [visibleFilter, setVisibleFilter] = useState(initialVisibleFilter);
  const [sortOption, setSortOption] =
    useState<ProductSortOption>(initialSortOption);

  useEffect(() => {
    setVisibleFilter(initialVisibleFilter);
  }, [initialVisibleFilter]);

  useEffect(() => {
    setSortOption(initialSortOption);
  }, [initialSortOption]);

  return (
    <FilterSortBar
      {...props}
      visibleFilter={visibleFilter}
      sortOption={sortOption}
      onToggleFilter={() => {
        setVisibleFilter((current) => !current);
        onToggleFilter();
      }}
      onSortChange={(nextSortOption) => {
        setSortOption(nextSortOption);
        onSortChange(nextSortOption);
      }}
    />
  );
}

const meta = {
  title: 'Features/ProductFilter/FilterSortBar',
  component: FilterSortBar,
  tags: ['autodocs'],
  args: {
    resultCount: 128,
    visibleFilter: false,
    sortOption: 'relevance',
    isSorting: false,
    onToggleFilter: fn(),
    onSortChange: fn(),
  },
  argTypes: {
    sortOption: {
      control: 'select',
      options: [
        'relevance',
        'name_asc',
        'name_desc',
        'price_asc',
        'price_desc',
      ],
    },
    onToggleFilter: {
      control: false,
      table: { disable: true },
    },
    onSortChange: {
      control: false,
      table: { disable: true },
    },
  },
  render: (args) => <FilterSortBarPreview {...args} />,
} satisfies Meta<typeof FilterSortBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilterVisible: Story = {
  name: 'Filter Visible',
  args: {
    visibleFilter: true,
  },
};

export const ToggleFilter: Story = {
  name: 'Toggle Filter',
  play: async ({ canvas }) => {
    const filterButton = await canvas.findByRole('button', {
      name: /필터 표시|Show filters/,
    });

    await userEvent.click(filterButton);
    await expect(
      canvas.getByRole('button', { name: /필터 숨기기|Hide filters/ }),
    ).toBeVisible();
  },
};

export const Sorting: Story = {
  args: {
    isSorting: true,
  },
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button');
    const sortButton = buttons.at(-1);

    await expect(sortButton).toBeDisabled();
  },
};
