import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { routing } from '@shared/config/i18n/routing';

import enMessages from '../../../../messages/en.json';
import koMessages from '../../../../messages/ko.json';
import { TEST_API_URL } from '../../../../test/mocks/handlers';
import { server } from '../../../../test/mocks/server';
import {
  createTestQueryClient,
  TestIntlProvider,
} from '../../../../test/render';

import AiProductAssistant from './AiProductAssistant';

import type { Locale } from 'next-intl';

const messagesByLocale = { ko: koMessages, en: enMessages };
const endpoint = `${TEST_API_URL}/api/ai/product-assistant`;
const t = koMessages.AiProductAssistant;

function intentResponse(summary: string) {
  return HttpResponse.json({
    items: {
      intent: {
        categoryHint: 'mouse',
        hardRequirements: ['large hand size'],
        preferences: [],
        priority: ['large hand size'],
        priceRange: { min: null, max: null, currency: null },
        summary,
      },
    },
    message: 'Success',
  });
}

function renderAssistant(locale: Locale = 'ko') {
  const queryClient = createTestQueryClient();
  const user = userEvent.setup();

  render(
    <TestIntlProvider
      locale={locale}
      messages={{
        AiProductAssistant: messagesByLocale[locale].AiProductAssistant,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AiProductAssistant />
      </QueryClientProvider>
    </TestIntlProvider>,
  );

  return { user, input: screen.getByRole('textbox') };
}

describe('AiProductAssistant', () => {
  it.each(routing.locales)(
    '%s 제목, 입력 이름, 개인정보·Gemini 전송 안내를 표시한다',
    (locale) => {
      const messages = messagesByLocale[locale].AiProductAssistant;
      const { input } = renderAssistant(locale);

      expect(
        screen.getByRole('region', { name: messages.title }),
      ).toBeVisible();
      expect(
        screen.getByRole('heading', { name: messages.title }),
      ).toBeVisible();
      expect(input).toHaveAccessibleName(messages.promptLabel);
      expect(input).toHaveAttribute('maxlength', '500');
      expect(input).toHaveAccessibleDescription(messages.privacy);
      expect(screen.getByText(messages.privacy)).toBeVisible();
      expect(screen.getByText(messages.description)).toBeVisible();
      expect(
        screen.getByRole('button', { name: messages.submit }),
      ).toBeDisabled();
    },
  );

  it.each(['', '   ', 'a'.repeat(501)])(
    '유효하지 않은 질문은 전송하지 않는다',
    async (prompt) => {
      const request = vi.fn(() => intentResponse('Unexpected summary'));
      server.use(http.post(endpoint, request));
      const { input } = renderAssistant();
      fireEvent.change(input, { target: { value: prompt } });

      fireEvent.submit(input.closest('form')!);

      expect(screen.getByRole('button', { name: t.submit })).toBeDisabled();
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('질문만 전송하고 loading 중 중복 submit을 막은 뒤 의도 요약만 표시한다', async () => {
    let resolveResponse!: () => void;
    let sentBody: unknown;
    const responseReady = new Promise<void>((resolve) => {
      resolveResponse = resolve;
    });
    const request = vi.fn(async ({ request }: { request: Request }) => {
      sentBody = await request.json();
      await responseReady;
      return intentResponse(
        'Looking for a comfortable mouse.\n<script>not executable</script>',
      );
    });
    server.use(http.post(endpoint, request));
    const { user, input } = renderAssistant();

    try {
      await user.type(input, '  A comfortable mouse for small hands?  ');
      await user.click(screen.getByRole('button', { name: t.submit }));

      await waitFor(() => expect(request).toHaveBeenCalledOnce());
      expect(await screen.findByText(t.loading)).toBeVisible();
      expect(screen.getByRole('button', { name: t.submit })).toBeDisabled();
      fireEvent.submit(input.closest('form')!);
      expect(request).toHaveBeenCalledOnce();
      expect(sentBody).toEqual({
        prompt: 'A comfortable mouse for small hands?',
      });
    } finally {
      resolveResponse();
    }

    expect(
      await screen.findByText(/Looking for a comfortable mouse\./),
    ).toHaveTextContent('<script>not executable</script>');
    expect(screen.getByRole('status')).toHaveTextContent(t.analysisTitle);
    expect(screen.getByRole('status')).not.toHaveTextContent(
      /categoryHint|large hand size|priceRange/,
    );
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByRole('button', { name: t.submit })).toBeEnabled();
  });

  it('키보드로 submit하고 새 요약으로 교체하며 이전 대화는 전송하지 않는다', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(endpoint, async ({ request }) => {
        bodies.push(await request.json());
        return intentResponse(
          bodies.length === 1 ? 'First summary' : 'Second summary',
        );
      }),
    );
    const { user, input } = renderAssistant();
    await user.type(input, 'First question');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('First summary')).toBeVisible();

    await user.clear(input);
    await user.type(input, 'Second question');
    await user.click(screen.getByRole('button', { name: t.submit }));

    expect(await screen.findByText('Second summary')).toBeVisible();
    expect(screen.queryByText('First summary')).not.toBeInTheDocument();
    expect(bodies).toEqual([
      { prompt: 'First question' },
      { prompt: 'Second question' },
    ]);
  });

  it.each([401, 500])(
    '%s 오류를 번역된 안내로 표시하고 내부 오류는 숨긴다',
    async (status) => {
      server.use(
        http.post(endpoint, () =>
          HttpResponse.json({ message: 'private-provider-error' }, { status }),
        ),
      );
      const { user, input } = renderAssistant();
      await user.type(input, 'A comfortable mouse?');
      await user.click(screen.getByRole('button', { name: t.submit }));

      expect(await screen.findByRole('alert')).toHaveTextContent(
        status === 401 ? t.loginRequired : t.error,
      );
      expect(
        screen.queryByText('private-provider-error'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: t.submit })).toBeEnabled();
    },
  );

  it('네트워크 오류 뒤 같은 질문을 다시 시도할 수 있다', async () => {
    server.use(http.post(endpoint, () => HttpResponse.error()));
    const { user, input } = renderAssistant();
    await user.type(input, 'A comfortable mouse?');
    await user.click(screen.getByRole('button', { name: t.submit }));
    expect(await screen.findByRole('alert')).toHaveTextContent(t.error);

    server.use(http.post(endpoint, () => intentResponse('Recovered summary')));
    await user.click(screen.getByRole('button', { name: t.submit }));
    expect(await screen.findByText('Recovered summary')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
