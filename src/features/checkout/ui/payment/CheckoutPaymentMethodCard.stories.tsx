import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';

import { expect, fn, userEvent } from 'storybook/test';

import CheckoutPaymentMethodCard from './CheckoutPaymentMethodCard';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

type PaymentMethodCardPreviewProps = ComponentProps<
  typeof CheckoutPaymentMethodCard
>;

function PaymentMethodCardPreview({
  isSelected: initialIsSelected,
  onSelectMethod,
  ...props
}: PaymentMethodCardPreviewProps) {
  const [isSelected, setIsSelected] = useState(initialIsSelected);

  useEffect(() => {
    setIsSelected(initialIsSelected);
  }, [initialIsSelected]);

  return (
    <CheckoutPaymentMethodCard
      {...props}
      isSelected={isSelected}
      onSelectMethod={(method) => {
        setIsSelected(true);
        onSelectMethod(method);
      }}
    />
  );
}

const meta = {
  title: 'Features/Checkout/CheckoutPaymentMethodCard',
  component: CheckoutPaymentMethodCard,
  tags: ['autodocs'],
  args: {
    method: 'test',
    title: 'Test payment',
    description: 'Confirm the checkout flow without an external payment.',
    isSelected: false,
    disabled: false,
    onSelectMethod: fn(),
  },
  argTypes: {
    method: {
      control: 'inline-radio',
      options: ['test', 'demo'],
    },
    onSelectMethod: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  render: (args) => <PaymentMethodCardPreview {...args} />,
} satisfies Meta<typeof CheckoutPaymentMethodCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const SelectPaymentMethod: Story = {
  name: 'Select Payment Method',
  play: async ({ args, canvas }) => {
    const card = canvas.getByRole('button');

    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(card);
    await expect(args.onSelectMethod).toHaveBeenCalledWith('test');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
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
