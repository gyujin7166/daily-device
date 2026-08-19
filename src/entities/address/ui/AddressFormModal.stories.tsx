import { expect, fn, userEvent } from 'storybook/test';

import AddressFormModal from './AddressFormModal';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const editingAddress = {
  name: '김데일리',
  phone_number: '01012345678',
  address_1: '서울특별시 성동구 성수이로 10',
  address_2: '101동 1203호',
};

const meta = {
  title: 'Entities/Address/AddressFormModal',
  component: AddressFormModal,
  tags: ['autodocs'],
  args: {
    isSaving: false,
    onClose: fn(),
    onCancel: fn(),
    onSave: fn(async () => undefined),
    onInvalid: fn(),
  },
  argTypes: {
    onClose: { control: false, table: { disable: true } },
    onCancel: { control: false, table: { disable: true } },
    onSave: { control: false, table: { disable: true } },
    onInvalid: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof AddressFormModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Editing: Story = {
  args: {
    title: '배송지 수정',
    initialValues: editingAddress,
    initialIsDefault: true,
  },
};

export const ToggleDefaultAddress: Story = {
  name: 'Toggle Default Address',
  args: {
    initialValues: editingAddress,
  },
  play: async ({ canvas }) => {
    const defaultSwitch = canvas.getByRole('switch', {
      name: /기본 배송지로 설정|Set as default address/,
    });

    await expect(defaultSwitch).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(defaultSwitch);
    await expect(defaultSwitch).toHaveAttribute('aria-checked', 'true');
  },
};

export const Saving: Story = {
  args: {
    initialValues: editingAddress,
    isSaving: true,
  },
};
