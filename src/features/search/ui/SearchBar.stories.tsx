import { useEffect, useState } from 'react';
import type { ChangeEvent, ComponentProps } from 'react';

import { expect, fn, userEvent, waitFor } from 'storybook/test';

import SearchBar from './SearchBar';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type SearchBarPreviewProps = Pick<
  ComponentProps<typeof SearchBar>,
  'inputText'
> & {
  onClose: ComponentProps<typeof SearchBar>['setShowSearchBar'];
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function SearchBarPreview({
  inputText: initialInputText,
  onClose,
  onInputChange,
}: SearchBarPreviewProps) {
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [inputText, setInputText] = useState(initialInputText);

  useEffect(() => {
    setShowSearchBar(true);
    setInputText(initialInputText);
  }, [initialInputText]);

  return (
    <SearchBar
      showSearchBar={showSearchBar}
      setShowSearchBar={(nextValue) => {
        setShowSearchBar((currentValue) => {
          const resolvedValue =
            typeof nextValue === 'function'
              ? nextValue(currentValue)
              : nextValue;

          if (!resolvedValue) {
            onClose(false);
          }

          return resolvedValue;
        });
      }}
      setShowSearchSuggestion={fn()}
      onInputChange={(event) => {
        setInputText(event.currentTarget.value);
        onInputChange(event);
      }}
      inputText={inputText}
    />
  );
}

const meta = {
  title: 'Features/Search/SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  args: {
    showSearchBar: true,
    inputText: '',
    setShowSearchBar: fn(),
    setShowSearchSuggestion: fn(),
    onInputChange: fn(),
  },
  argTypes: {
    showSearchBar: { table: { disable: true } },
    setShowSearchBar: { control: false, table: { disable: true } },
    setShowSearchSuggestion: { control: false, table: { disable: true } },
    onInputChange: { control: false, table: { disable: true } },
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
  render: (args) => (
    <SearchBarPreview
      inputText={args.inputText}
      onClose={args.setShowSearchBar}
      onInputChange={args.onInputChange}
    />
  ),
} satisfies Meta<typeof SearchBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithQuery: Story = {
  name: 'With Query',
  args: {
    inputText: 'mechanical keyboard',
  },
};

export const CloseSearch: Story = {
  name: 'Close Search',
  play: async ({ canvas }) => {
    const searchInput = canvas.getByRole('textbox');
    const closeButton = canvas.getByRole('button', {
      name: /닫기|Close/,
    });

    await expect(searchInput).toBeVisible();
    await userEvent.click(closeButton);
    await waitFor(async () => {
      await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    });
  },
};
