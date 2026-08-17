import { Suspense } from 'react';

import { HttpResponse, http } from 'msw';
import { expect, userEvent } from 'storybook/test';

import MyAddressSkeleton from '@features/my/ui/skeletons/MyAddressSkeleton';

import type { UserAddress } from '@entities/address/model/types';

import MyAddressContent from './MyAddressContent';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const addresses: UserAddress[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  recipientName: index === 0 ? '김데일리' : `배송지 ${index + 1}`,
  recipientPhone: `0101234567${index}`,
  address1:
    index % 2 === 0 ? '서울시 중구 세종대로 1' : '서울시 성동구 성수이로 10',
  address2: `${index + 1}01호`,
  isDefault: index === 0,
  updatedAt: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
}));

const createAddressHandlers = (fixture: UserAddress[]) => [
  http.get('*/api/addresses', () =>
    HttpResponse.json({ items: fixture, message: 'Success' }),
  ),
  http.post('*/api/addresses', async ({ request }) => {
    const body = (await request.json()) as { id?: number };

    return HttpResponse.json({
      items: { id: body.id ?? 999 },
      message: 'Success',
    });
  }),
  http.delete('*/api/addresses/:addressId', ({ params }) =>
    HttpResponse.json({
      items: { deletedId: Number(params.addressId) },
      message: 'Success',
    }),
  ),
];

const meta = {
  title: 'Pages/My/Address/MyAddressContent',
  component: MyAddressContent,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-5xl">
        <Suspense fallback={<MyAddressSkeleton />}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/my/address',
      },
    },
  },
} satisfies Meta<typeof MyAddressContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    msw: {
      handlers: createAddressHandlers(addresses.slice(0, 2)),
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: createAddressHandlers([]),
    },
  },
};

export const OpenCreateAddress: Story = {
  name: 'Open Create Address',
  parameters: {
    msw: {
      handlers: createAddressHandlers(addresses.slice(0, 2)),
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: /배송지 추가|Add address/i,
      }),
    );

    await expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const OpenEditAddress: Story = {
  name: 'Open Edit Address',
  parameters: {
    msw: {
      handlers: createAddressHandlers(addresses.slice(0, 2)),
    },
  },
  play: async ({ canvas }) => {
    const editButtons = await canvas.findAllByRole('button', {
      name: /배송지 수정|Edit address/i,
    });

    await userEvent.click(editButtons[0]);
    await expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const Paginated: Story = {
  parameters: {
    msw: {
      handlers: createAddressHandlers(addresses),
    },
  },
};
