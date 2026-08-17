import { HttpResponse, delay, http } from 'msw';

import TossSuccessContainer from './TossSuccessContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const successPath = '/payments/toss/success';
const paymentQuery = {
  paymentKey: 'TEST_PAYMENT_KEY_STORYBOOK',
  orderId: 'ORDER-STORYBOOK-001',
  amount: '189000',
};

const confirmingHandler = http.post('*/api/payments/toss/confirm', async () => {
  await delay('infinite');

  return HttpResponse.json({ items: { orderId: paymentQuery.orderId } });
});

const confirmedHandler = http.post('*/api/payments/toss/confirm', () =>
  HttpResponse.json({ items: { orderId: paymentQuery.orderId } }),
);

const confirmationErrorHandler = http.post('*/api/payments/toss/confirm', () =>
  HttpResponse.json({}, { status: 503 }),
);

const meta = {
  title: 'Pages/Payments/Toss/TossSuccessContainer',
  component: TossSuccessContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: successPath,
        query: paymentQuery,
      },
    },
    msw: {
      handlers: [confirmingHandler],
    },
  },
} satisfies Meta<typeof TossSuccessContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Confirming: Story = {};

export const PaymentConfirmed: Story = {
  name: 'Payment Confirmed',
  parameters: {
    msw: {
      handlers: [confirmedHandler],
    },
  },
};

export const ConfirmationError: Story = {
  name: 'Confirmation Error',
  parameters: {
    msw: {
      handlers: [confirmationErrorHandler],
    },
  },
};

export const InvalidResponse: Story = {
  name: 'Invalid Response',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: successPath,
        query: {
          paymentKey: '',
          orderId: '',
          amount: '',
        },
      },
    },
  },
};
