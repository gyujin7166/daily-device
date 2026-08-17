import { SessionProvider } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { expect, userEvent } from 'storybook/test';

import MyPageSectionHeader from './MyPageSectionHeader';
import MyPageShell from './MyPageShell';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Session } from 'next-auth';

const session: Session = {
  user: {
    name: '김데일리',
    email: 'yun@daily-device.dev',
  },
  expires: '2099-12-31T23:59:59.999Z',
};

function MyPageShellPreviewContent() {
  const t = useTranslations('MyOverview.page');

  return (
    <section className="w-full rounded-2xl lg:pl-4">
      <MyPageSectionHeader
        label="SUMMARY"
        title={t('title')}
        description={t('description', { name: session.user?.name ?? '' })}
      />
    </section>
  );
}

const meta = {
  title: 'Features/My/MyPageShell',
  component: MyPageShell,
  tags: ['autodocs'],
  args: {
    activeTab: 'overview',
    children: null,
  },
  argTypes: {
    activeTab: {
      control: 'select',
      options: [
        'overview',
        'orders',
        'wishlist',
        'address',
        'write-review',
        'reviews',
      ],
    },
    children: { control: false, table: { disable: true } },
  },
  render: (args) => (
    <SessionProvider
      session={session}
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      <MyPageShell {...args}>
        <MyPageShellPreviewContent />
      </MyPageShell>
    </SessionProvider>
  ),
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/my',
      },
    },
  },
} satisfies Meta<typeof MyPageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileMenuOpen: Story = {
  name: 'Mobile Menu Open',
  globals: {
    viewport: 'mobile2',
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /메뉴 열기|Open .* menu/i }),
    );

    await expect(canvas.getByRole('dialog')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: /주문 목록|Orders/i }),
    ).toBeVisible();
  },
};
