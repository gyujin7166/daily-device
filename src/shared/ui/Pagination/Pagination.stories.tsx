import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import Pagination from './Pagination';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type PaginationPreviewProps = ComponentProps<typeof Pagination>;

function PaginationPreview({
  totalItems,
  itemsPerPage,
  currentPage: initialPage,
  disabled,
}: PaginationPreviewProps) {
  const scrollRef = useRef<HTMLElement | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return (
    <section
      ref={scrollRef}
      className="flex min-h-48 items-center justify-center"
    >
      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        scrollRef={scrollRef}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        disabled={disabled}
      />
    </section>
  );
}

const meta = {
  title: 'Shared/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    totalItems: 96,
    itemsPerPage: 8,
    currentPage: 1,
    disabled: false,
    scrollRef: { current: null },
    setCurrentPage: fn(),
  },
  argTypes: {
    scrollRef: {
      control: false,
      table: { disable: true },
    },
    setCurrentPage: {
      control: false,
      table: { disable: true },
    },
  },
  render: (args) => <PaginationPreview {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GoToNextPage: Story = {
  name: 'Go To Next Page',
  play: async ({ canvas }) => {
    const currentPage = canvas.getByRole('button', { current: 'page' });

    await expect(currentPage).toHaveTextContent('1');
    await userEvent.click(
      canvas.getByRole('button', { name: /다음 페이지|Next page/ }),
    );
    await expect(
      canvas.getByRole('button', { current: 'page' }),
    ).toHaveTextContent('2');
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 6,
  },
};

export const Disabled: Story = {
  args: {
    currentPage: 4,
    disabled: true,
  },
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button');

    for (const button of buttons) {
      await expect(button).toBeDisabled();
    }
  },
};
