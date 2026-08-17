import TossFailContainer from './TossFailContainer';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Pages/Payments/Toss/TossFailContainer',
  component: TossFailContainer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/payments/toss/fail',
        query: {
          code: 'PAY_PROCESS_CANCELED',
          message: '결제가 취소되었습니다.',
        },
      },
    },
  },
} satisfies Meta<typeof TossFailContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
