import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent, waitFor } from 'storybook/test';

import NavActions from './NavActions';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type NavActionsPreviewProps = ComponentProps<typeof NavActions>;

function NavActionsPreview({
  isSearchOpen: initialIsSearchOpen,
  handleToggleSearch,
  ...props
}: NavActionsPreviewProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(initialIsSearchOpen);

  useEffect(() => {
    setIsSearchOpen(initialIsSearchOpen);
  }, [initialIsSearchOpen]);

  return (
    <NavActions
      {...props}
      isSearchOpen={isSearchOpen}
      handleToggleSearch={() => {
        setIsSearchOpen((current) => !current);
        handleToggleSearch();
      }}
    />
  );
}

const meta = {
  title: 'Widgets/Navigation/NavActions',
  component: NavActions,
  tags: ['autodocs'],
  args: {
    handleToggleSearch: fn(),
    isSearchOpen: false,
    isOverlayStyle: false,
    isDarkOverlayStyle: false,
    onActionClick: fn(),
  },
  argTypes: {
    handleToggleSearch: {
      control: false,
      table: { disable: true },
    },
    onActionClick: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="flex justify-end">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  render: (args) => <NavActionsPreview {...args} />,
} satisfies Meta<typeof NavActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ToggleSearch: Story = {
  name: 'Toggle Search',
  play: async ({ canvas }) => {
    const searchButton = canvas.getByRole('button', {
      name: /검색|Search/,
    });

    await expect(searchButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(searchButton);
    await expect(searchButton).toHaveAttribute('aria-pressed', 'true');
  },
};

export const OpenLocaleMenu: Story = {
  name: 'Open Locale Menu',
  play: async ({ canvas }) => {
    const localeButton = canvas.getByRole('button', {
      name: /언어 변경|Change language/,
    });

    await userEvent.click(localeButton);
    await expect(localeButton).toHaveAttribute('aria-expanded', 'true');
    await waitFor(async () => {
      await expect(canvas.getByRole('menu')).toBeVisible();
    });
  },
};
