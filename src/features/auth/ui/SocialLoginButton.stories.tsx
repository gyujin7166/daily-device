import { expect, fn } from 'storybook/test';

import SocialLoginButton from './SocialLoginButton';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Features/Auth/SocialLoginButton',
  component: SocialLoginButton,
  tags: ['autodocs'],
  args: {
    provider: 'google',
    onClick: fn(),
    disabled: false,
  },
  argTypes: {
    provider: {
      control: 'inline-radio',
      options: ['google', 'naver', 'kakao'],
    },
    onClick: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SocialLoginButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Naver: Story = {
  args: {
    provider: 'naver',
  },
};

export const Kakao: Story = {
  args: {
    provider: 'kakao',
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
