import { fn } from 'storybook/test';

import LoginContentSection from './LoginContentSection';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/Auth/LoginContentSection',
  component: LoginContentSection,
  tags: ['autodocs'],
  args: {
    onSocialLogin: fn(),
    onDemoLogin: fn(),
    isDemoSigningIn: false,
  },
  argTypes: {
    onSocialLogin: { control: false, table: { disable: true } },
    onDemoLogin: { control: false, table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen items-center justify-center bg-canvas py-12 dark:bg-dark-bg">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/login',
      },
    },
  },
} satisfies Meta<typeof LoginContentSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DemoSigningIn: Story = {
  name: 'Demo Signing In',
  args: {
    isDemoSigningIn: true,
  },
};
