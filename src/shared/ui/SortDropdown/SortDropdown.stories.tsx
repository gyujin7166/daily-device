import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import SortDropdown from './SortDropdown';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Lowest price' },
] as const;

type SortDropdownPreviewProps = ComponentProps<typeof SortDropdown>;

function SortDropdownPreview({
  value: initialValue,
  options,
  onChange,
  ...props
}: SortDropdownPreviewProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="inline-flex">
      <SortDropdown
        {...props}
        value={value}
        options={options}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChange(nextValue);
        }}
      />
    </div>
  );
}

const meta = {
  title: 'Shared/SortDropdown',
  component: SortDropdown,
  tags: ['autodocs'],
  args: {
    value: 'recommended',
    options: sortOptions,
    onChange: fn(),
    disabled: false,
  },
  argTypes: {
    options: {
      control: false,
    },
    onChange: {
      control: false,
      table: { disable: true },
    },
  },
  render: (args) => <SortDropdownPreview {...args} />,
} satisfies Meta<typeof SortDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Open: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { expanded: false });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const SelectLowestPrice: Story = {
  name: 'Select Lowest Price',
  play: async ({ args, canvas }) => {
    const trigger = canvas.getByRole('button', { expanded: false });

    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole('option', { name: 'Lowest price' }));

    await expect(args.onChange).toHaveBeenCalledWith('price-asc');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveTextContent('Lowest price');
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};
