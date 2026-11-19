import { delay, HttpResponse, http } from 'msw';
import { expect, userEvent } from 'storybook/test';

import AiProductAssistant from './AiProductAssistant';
import { recommendedResult } from './AiProductAssistant.storyFixtures';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const endpoint = '*/api/ai/product-assistant';
const question = '조용하고 10만 원 이하인 무선 마우스를 찾고 있어요.';

const recommendationHandler = http.post(endpoint, () =>
  HttpResponse.json({ items: recommendedResult, message: 'Success' }),
);

const pendingHandler = http.post(endpoint, async () => {
  await delay('infinite');

  return HttpResponse.json({ items: recommendedResult, message: 'Success' });
});

const rateLimitedHandler = http.post(endpoint, () =>
  HttpResponse.json(
    { message: 'Too Many Requests', code: 'AI_RATE_LIMITED' },
    { status: 429 },
  ),
);

const meta = {
  title: 'Features/AiProductAssistant/AiProductAssistant',
  component: AiProductAssistant,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
} satisfies Meta<typeof AiProductAssistant>;

export default meta;

type Story = StoryObj<typeof meta>;

type PlayContext = Parameters<NonNullable<Story['play']>>[0];

const submitQuestion = async ({ canvas }: PlayContext) => {
  await userEvent.type(canvas.getByRole('textbox'), question);
  await userEvent.click(
    canvas.getByRole('button', { name: /AI에게 질문하기|Ask AI/ }),
  );
};

export const Default: Story = {};

export const AskForRecommendation: Story = {
  name: 'Ask For Recommendation',
  parameters: {
    msw: {
      handlers: [recommendationHandler],
    },
  },
  play: async (context) => {
    await submitQuestion(context);

    const items = await context.canvas.findAllByRole('listitem');

    await expect(items).toHaveLength(2);
    await expect(
      context.canvas.getByRole('heading', {
        name: 'Daily Device Wireless Mouse',
      }),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [pendingHandler],
    },
  },
  play: async (context) => {
    await submitQuestion(context);

    await expect(
      await context.canvas.findByText(
        /상품을 확인하고 있습니다|Checking products/,
      ),
    ).toBeVisible();
    await expect(context.canvas.getByRole('textbox')).toBeDisabled();
  },
};

export const RateLimited: Story = {
  name: 'Rate Limited',
  parameters: {
    msw: {
      handlers: [rateLimitedHandler],
    },
  },
  play: async (context) => {
    await submitQuestion(context);

    await expect(await context.canvas.findByRole('alert')).toHaveTextContent(
      /AI 요청이 많아|too many requests/,
    );
    await expect(
      context.canvas.getByRole('button', { name: /AI에게 질문하기|Ask AI/ }),
    ).toBeEnabled();
  },
};
