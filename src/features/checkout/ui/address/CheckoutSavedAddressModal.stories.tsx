import { expect, fn } from 'storybook/test';

import type { UserAddress } from '@entities/address/model/types';

import CheckoutSavedAddressModal from './CheckoutSavedAddressModal';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const savedAddresses: UserAddress[] = [
  {
    id: 1,
    recipientName: '김데일리',
    recipientPhone: '010-1234-5678',
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '데일리빌딩 7층',
    isDefault: true,
    updatedAt: '2026-08-12T00:00:00.000Z',
  },
  {
    id: 2,
    recipientName: '이디바이스',
    recipientPhone: '010-9876-5432',
    address1: '서울특별시 마포구 월드컵북로 45',
    address2: null,
    isDefault: false,
    updatedAt: '2026-08-11T00:00:00.000Z',
  },
];

const defaultState = {
  isOpen: true,
  hasSavedAddresses: true,
  orderedAddresses: savedAddresses,
  selectedAddressId: 1,
  hasDefaultAddress: true,
  recentAddressId: 2,
  isAddressActionBusy: false,
};

const meta = {
  title: 'Features/Checkout/CheckoutSavedAddressModal',
  component: CheckoutSavedAddressModal,
  tags: ['autodocs'],
  args: {
    state: defaultState,
    actions: {
      onClose: fn(),
      onSwitchToNewMode: fn(),
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
} satisfies Meta<typeof CheckoutSavedAddressModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    state: {
      ...defaultState,
      hasSavedAddresses: false,
      orderedAddresses: [],
      selectedAddressId: null,
      hasDefaultAddress: false,
      recentAddressId: null,
    },
  },
};

export const Busy: Story = {
  args: {
    state: {
      ...defaultState,
      isAddressActionBusy: true,
    },
  },
  play: async ({ canvas }) => {
    const editButtons = canvas.getAllByRole('button', { name: /수정|Edit/ });
    const deleteButtons = canvas.getAllByRole('button', {
      name: /삭제|Delete/,
    });

    for (const button of [...editButtons, ...deleteButtons]) {
      await expect(button).toBeDisabled();
    }
  },
};
