import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { productRecommendationSchema } from '@features/ai-product-assistant/model/productRecommendation';
import { productSearchIntentSchema } from '@features/ai-product-assistant/model/productSearchIntent';

import { generateGeminiStructuredOutput } from '@shared/lib/gemini/generateGeminiText';

const createInteraction = vi.hoisted(() => vi.fn());

vi.mock('server-only', () => ({}));
vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    interactions = { create: createInteraction };
  },
}));

const keyboardIntent = {
  categoryHint: 'keyboard',
  hardRequirements: ['wireless', 'under 100000 KRW'],
  preferences: ['quiet'],
  priority: ['wireless', 'under 100000 KRW', 'quiet'],
  priceRange: { min: null, max: 100000, currency: 'KRW' },
  summary:
    '10만 원 이하의 무선 키보드를 찾고 있으며, 조용한 제품을 선호합니다.',
};

const recommendation = {
  answer: 'This candidate matches the verified requirements.',
  recommendations: [{ productId: 20, reason: 'Meets the requested budget.' }],
};

describe('generateGeminiStructuredOutput', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key');
    vi.stubEnv('GEMINI_MODEL', 'gemini-3.6-flash');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('GEMINI_MODEL이 없으면 Flash-Lite 기본 모델을 사용한다', async () => {
    vi.stubEnv('GEMINI_MODEL', undefined);
    createInteraction.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify(keyboardIntent),
    });

    await expect(
      generateGeminiStructuredOutput(
        'A wireless keyboard?',
        productSearchIntentSchema,
      ),
    ).resolves.toEqual(keyboardIntent);
    expect(createInteraction).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        model: 'gemini-3.5-flash-lite',
        store: false,
      }),
    );
  });

  it.each([
    {
      caseName: 'invalid JSON',
      output: '{private-output',
      error: 'Gemini returned invalid JSON.',
    },
    ...[
      {
        caseName: 'empty recommendations',
        value: { ...recommendation, recommendations: [] },
      },
      {
        caseName: 'more than three recommendations',
        value: {
          ...recommendation,
          recommendations: [20, 21, 22, 23].map((productId) => ({
            productId,
            reason: 'Matches a verified condition.',
          })),
        },
      },
      {
        caseName: 'invalid product ID',
        value: {
          ...recommendation,
          recommendations: [{ productId: 0, reason: 'Invalid candidate.' }],
        },
      },
      { caseName: 'blank answer', value: { ...recommendation, answer: '   ' } },
      {
        caseName: 'overlong answer',
        value: { ...recommendation, answer: 'a'.repeat(501) },
      },
      {
        caseName: 'Markdown reason',
        value: {
          ...recommendation,
          recommendations: [{ productId: 20, reason: '**Highlighted**' }],
        },
      },
      {
        caseName: 'HTML answer',
        value: { ...recommendation, answer: '<b>Marked up</b>' },
      },
      {
        caseName: 'overlong reason',
        value: {
          ...recommendation,
          recommendations: [{ productId: 20, reason: 'a'.repeat(281) }],
        },
      },
    ].map(({ caseName, value }) => ({
      caseName,
      output: JSON.stringify(value),
      error: 'Gemini response did not match the schema.',
    })),
  ])('잘못된 추천 결과를 거부한다 ($caseName)', async ({ output, error }) => {
    createInteraction.mockResolvedValue({
      status: 'completed',
      output_text: output,
    });

    await expect(
      generateGeminiStructuredOutput(
        'Recommend a candidate.',
        productRecommendationSchema,
      ),
    ).rejects.toThrow(error);
  });

  it('JSON 응답 형식과 low thinking을 요청하고 검증한 의도를 반환한다', async () => {
    createInteraction.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify(keyboardIntent),
    });

    await expect(
      generateGeminiStructuredOutput(
        'A wireless keyboard?',
        productSearchIntentSchema,
        {
          thinkingLevel: 'low',
        },
      ),
    ).resolves.toEqual(keyboardIntent);
    expect(createInteraction).toHaveBeenCalledExactlyOnceWith({
      model: 'gemini-3.6-flash',
      input: 'A wireless keyboard?',
      store: false,
      generation_config: { thinking_level: 'low' },
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: expect.objectContaining({
          type: 'object',
          required: expect.arrayContaining(Object.keys(keyboardIntent)),
          additionalProperties: false,
        }),
      },
    });
  });

  it('상품 종류와 가격이 불분명하면 null과 빈 배열을 반환할 수 있다', async () => {
    const intent = {
      categoryHint: null,
      hardRequirements: [],
      preferences: [],
      priority: [],
      priceRange: { min: null, max: null, currency: null },
      summary: '업무에 사용할 기기를 찾고 있습니다.',
    };
    createInteraction.mockResolvedValue({
      status: 'completed',
      output_text: JSON.stringify(intent),
    });

    await expect(
      generateGeminiStructuredOutput(
        '업무용 기기가 필요합니다.',
        productSearchIntentSchema,
      ),
    ).resolves.toEqual(intent);
  });

  it.each([
    { output: '   ', error: 'Gemini returned an empty text response.' },
    { output: '{private-invalid-json', error: 'Gemini returned invalid JSON.' },
    {
      output: JSON.stringify({ ...keyboardIntent, summary: undefined }),
      error: 'Gemini response did not match the schema.',
    },
    {
      output: JSON.stringify({
        ...keyboardIntent,
        priceRange: { min: null, max: '100000', currency: 'KRW' },
      }),
      error: 'Gemini response did not match the schema.',
    },
    {
      output: JSON.stringify({
        ...keyboardIntent,
        productId: 'private-invented-id',
      }),
      error: 'Gemini response did not match the schema.',
    },
  ])(
    '형식이 잘못된 Gemini 응답을 거부한다 ($error)',
    async ({ output, error }) => {
      createInteraction.mockResolvedValue({
        status: 'completed',
        output_text: output,
      });

      await expect(
        generateGeminiStructuredOutput(
          'A wireless keyboard?',
          productSearchIntentSchema,
        ),
      ).rejects.toThrow(new Error(error));
    },
  );
});
