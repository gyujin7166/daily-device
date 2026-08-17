import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import type { UserAddress } from '@entities/address/model/types';

import SavedAddressCard from './SavedAddressCard';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const sampleAddress: UserAddress = {
  id: 7,
  recipientName: '김데일리',
  recipientPhone: '010-1234-5678',
  address1: '서울특별시 강남구 테헤란로 123',
  address2: '데일리빌딩 7층',
  isDefault: true,
  updatedAt: '2026-08-12T00:00:00.000Z',
};

type SavedAddressCardPreviewProps = ComponentProps<typeof SavedAddressCard>;

function SavedAddressCardPreview({
  state: initialState,
  actions,
}: SavedAddressCardPreviewProps) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  return (
    <SavedAddressCard
      state={state}
      actions={{
        ...actions,
        onSelectSavedAddress: (address) => {
          setState((current) => ({ ...current, isSelected: true }));
          actions.onSelectSavedAddress(address);
        },
      }}
    />
  );
}

const meta = {
  title: 'Features/Checkout/SavedAddressCard',
  component: SavedAddressCard,
  tags: ['autodocs'],
  args: {
    state: {
      item: sampleAddress,
      isSelected: false,
      isRecentBadgeTarget: false,
      isAddressActionBusy: false,
    },
    actions: {
      onSelectSavedAddress: fn(),
      onEditSavedAddress: fn(),
      onDeleteAddress: fn(),
    },
  },
  argTypes: {
    actions: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
  render: (args) => <SavedAddressCardPreview {...args} />,
} satisfies Meta<typeof SavedAddressCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    state: {
      item: sampleAddress,
      isSelected: true,
      isRecentBadgeTarget: false,
      isAddressActionBusy: false,
    },
  },
};

export const Recent: Story = {
  args: {
    state: {
      item: { ...sampleAddress, isDefault: false },
      isSelected: false,
      isRecentBadgeTarget: true,
      isAddressActionBusy: false,
    },
  },
};

export const SelectAddress: Story = {
  name: 'Select Address',
  play: async ({ canvas }) => {
    const selectButton = canvas.getByRole('button', {
      name: /김데일리.*배송지 선택|Select 김데일리's shipping address/,
    });

    await expect(selectButton).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(selectButton);
    await expect(selectButton).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Busy: Story = {
  args: {
    state: {
      item: sampleAddress,
      isSelected: false,
      isRecentBadgeTarget: false,
      isAddressActionBusy: true,
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /수정|Edit/ }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /삭제|Delete/ }),
    ).toBeDisabled();
  },
};
