import { fn } from 'storybook/test';

import messagesEn from '../../../../messages/en.json';
import messagesKo from '../../../../messages/ko.json';

import QueryErrorFallback from './QueryErrorFallback';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const meta = {
  title: 'Shared/QueryErrorFallback',
  component: QueryErrorFallback,
  tags: ['autodocs'],
  args: {
    title: messagesKo.ProductReview.errors.loadFailed,
    onRetry: fn(),
  },
  argTypes: {
    onRetry: {
      control: false,
      table: { disable: true },
    },
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QueryErrorFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

const getMessages = (locale: unknown) =>
  locale === 'en' ? messagesEn : messagesKo;

const renderQueryError: NonNullable<Story['render']> = (args, context) => {
  const messages = getMessages(context.globals.locale);

  return (
    <QueryErrorFallback
      {...args}
      title={messages.ProductReview.errors.loadFailed}
    />
  );
};

export const QueryError: Story = {
  name: 'Query Error',
  render: renderQueryError,
};

export const RouteError: Story = {
  name: 'Route Error',
  render: (args, context) => {
    const messages = getMessages(context.globals.locale);

    return (
      <QueryErrorFallback
        {...args}
        title={messages.RouteError.title}
        description={messages.RouteError.description}
      />
    );
  },
};
