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

import type { ProductAssistantResult } from '../model/productSearchCandidate';
import type { Locale } from 'next-intl';

const messagesByLocale = { ko: koMessages, en: enMessages };
const endpoint = `${TEST_API_URL}/api/ai/product-assistant`;
const t = koMessages.AiProductAssistant;

function recommendationResponse(
  answer: string,
  overrides: Partial<ProductAssistantResult> = {},
) {
  return HttpResponse.json({
    items: {
      intent: {
        categoryHint: 'mouse',
        hardRequirements: ['large hand size'],
        preferences: [],
        priority: ['large hand size'],
        priceRange: { min: null, max: null, currency: null },
        summary: 'Internal intent summary',
      },
      mapping: {
        category: { id: 1, slug: 'mice' },
        hardRequirements: [
          { requirement: 'large hand size', filterId: 2, filterOptionId: 9 },
        ],
        preferences: [],
        unmatchedHardRequirements: [],
        unmatchedPreferences: [],
      },
      candidates: [
        {
          id: 20,
          name: 'Recommended mouse',
          slug: 'large-mouse',
          description: 'Candidate description',
          categorySlug: 'mice',
          originalPrice: 120000,
          discountedPrice: 90000,
          discountRate: 25,
          matchedPreferences: [],
        },
        {
          id: 21,
          name: 'Unselected mouse',
          slug: 'unselected-mouse',
          description: 'Other candidate',
          categorySlug: 'mice',
          originalPrice: 60000,
          discountedPrice: 60000,
          discountRate: 0,
          matchedPreferences: [],
        },
      ],
      recommendation: {
        answer,
        recommendations: [
          { productId: 20, reason: 'Matches the verified hand size.' },
        ],
      },
      ...overrides,
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
      const request = vi.fn(() => recommendationResponse('Unexpected answer'));
      server.use(http.post(endpoint, request));
      const { input } = renderAssistant();
      fireEvent.change(input, { target: { value: prompt } });

      fireEvent.submit(input.closest('form')!);

      expect(screen.getByRole('button', { name: t.submit })).toBeDisabled();
      expect(request).not.toHaveBeenCalled();
    },
  );

  it('중복 submit을 막고 검증된 상품명, 판매가, 이유와 영어 상세 링크를 표시한다', async () => {
    let resolveResponse!: () => void;
    let sentBody: unknown;
    const responseReady = new Promise<void>((resolve) => {
      resolveResponse = resolve;
    });
    const request = vi.fn(async ({ request }: { request: Request }) => {
      sentBody = await request.json();
      await responseReady;
      return recommendationResponse(
        'Try this verified option.\n<script>not executable</script>',
      );
    });
    server.use(http.post(endpoint, request));
    const { user, input } = renderAssistant('en');
    const t = enMessages.AiProductAssistant;

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
        locale: 'en',
      });
    } finally {
      resolveResponse();
    }

    expect(
      await screen.findByText(/Try this verified option\./),
    ).toHaveTextContent('<script>not executable</script>');
    expect(
      screen.getByRole('heading', { name: 'AI recommendations' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Recommended mouse' }),
    ).toBeVisible();
    expect(screen.getByText('Matches the verified hand size.')).toBeVisible();
    expect(screen.getByText('₩90,000')).toBeVisible();
    expect(screen.getByRole('link', { name: /View product/i })).toHaveAttribute(
      'href',
      '/en/products/mice/large-mouse',
    );
    expect(
      screen.queryByText('Internal intent summary'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Unselected mouse')).not.toBeInTheDocument();
    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByRole('button', { name: t.submit })).toBeEnabled();
  });

  it('키보드로 submit하고 새 답변으로 교체하며 이전 대화는 전송하지 않는다', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.post(endpoint, async ({ request }) => {
        bodies.push(await request.json());
        return recommendationResponse(
          bodies.length === 1 ? 'First answer' : 'Second answer',
        );
      }),
    );
    const { user, input } = renderAssistant();
    await user.type(input, 'First question');
    await user.tab();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('First answer')).toBeVisible();

    await user.clear(input);
    await user.type(input, 'Second question');
    await user.click(screen.getByRole('button', { name: t.submit }));

    expect(await screen.findByText('Second answer')).toBeVisible();
    expect(screen.queryByText('First answer')).not.toBeInTheDocument();
    expect(bodies).toEqual([
      { prompt: 'First question', locale: 'ko' },
      { prompt: 'Second question', locale: 'ko' },
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

    server.use(
      http.post(endpoint, () => recommendationResponse('Recovered answer')),
    );
    await user.click(screen.getByRole('button', { name: t.submit }));
    expect(await screen.findByText('Recovered answer')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it.each([
    { category: null, message: /상품 종류를 조금 더 구체적으로/ },
    {
      category: { id: 1, slug: 'mice' },
      message: /조건에 맞는 상품을 찾지 못했습니다/,
    },
  ])(
    '추천이 없을 때 상황에 맞는 안내를 표시한다 (%j)',
    async ({ category, message }) => {
      server.use(
        http.post(endpoint, () =>
          recommendationResponse('Unused answer', {
            candidates: [],
            recommendation: null,
            mapping: {
              category,
              hardRequirements: [],
              preferences: [],
              unmatchedHardRequirements: [],
              unmatchedPreferences: [],
            },
          }),
        ),
      );
      const { user, input } = renderAssistant();
      await user.type(input, '업무용 제품');
      await user.click(screen.getByRole('button', { name: t.submit }));

      expect(await screen.findByText(message)).toBeVisible();
      expect(
        screen.queryByText('Internal intent summary'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /상품 보기/ }),
      ).not.toBeInTheDocument();
    },
  );

  it('미확인 조건과 적용되지 않은 비원화 가격을 안내한다', async () => {
    server.use(
      http.post(endpoint, () =>
        recommendationResponse('Verified choices', {
          intent: {
            categoryHint: 'mouse',
            hardRequirements: ['solar charging'],
            preferences: [],
            priority: ['solar charging'],
            summary: 'Internal intent summary',
            priceRange: { min: null, max: 100, currency: 'USD' },
          },
          mapping: {
            category: { id: 1, slug: 'mice' },
            hardRequirements: [],
            preferences: [],
            unmatchedHardRequirements: ['solar charging'],
            unmatchedPreferences: [],
          },
        }),
      ),
    );
    const { user, input } = renderAssistant();
    await user.type(input, '100달러 이하 태양광 마우스');
    await user.click(screen.getByRole('button', { name: t.submit }));

    expect(
      await screen.findByText(
        /일부 요청 조건은 현재 상품 데이터에서 확인할 수 없어/,
      ),
    ).toBeVisible();
    expect(screen.getByText(/원화로 확인되지 않은 가격 조건/)).toBeVisible();
    expect(screen.queryByText('solar charging')).not.toBeInTheDocument();
    expect(screen.getByText('90,000원')).toBeVisible();
    expect(screen.getByRole('link', { name: /상품 보기/ })).toHaveAttribute(
      'href',
      '/products/mice/large-mouse',
    );
  });
});
