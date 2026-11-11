import { beforeEach, describe, expect, it, vi } from 'vitest';

import { productRecommendationSchema } from '@features/ai-product-assistant/model/productRecommendation';
import { productSearchAnalysisSchema } from '@features/ai-product-assistant/model/productSearchMapping';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { UnauthorizedError } from '@shared/lib/errors/httpError';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  getRequiredUserId: vi.fn(),
  generateGeminiStructuredOutput: vi.fn(),
  findCategories: vi.fn(),
  findFilters: vi.fn(),
  getProductsPage: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@shared/lib/api/getRequiredUserId', () => ({
  getRequiredUserId: mocks.getRequiredUserId,
}));
vi.mock('@shared/lib/gemini/generateGeminiText', () => ({
  generateGeminiStructuredOutput: mocks.generateGeminiStructuredOutput,
}));
vi.mock('prisma/prismaClientSingleton', () => ({
  default: {
    productCategory: { findMany: mocks.findCategories },
    filter: { findMany: mocks.findFilters },
  },
}));
vi.mock('../../products/service', () => ({
  getProductsPage: mocks.getProductsPage,
}));

const categories = [
  { id: 1, slug: 'mice', name_en: 'Mice', name_ko: '마우스' },
  { id: 2, slug: 'keyboards', name_en: 'Keyboards', name_ko: '키보드' },
];
const filters = [
  {
    id: 2,
    categoryName: 'mice',
    name: '손 크기',
    options: [{ id: 9, name_en: 'large', name_ko: '큼' }],
  },
  {
    id: 4,
    categoryName: 'mice',
    name: '모양',
    options: [{ id: 15, name_en: 'asymmetric', name_ko: '비대칭' }],
  },
  {
    id: 5,
    categoryName: 'keyboards',
    name: '연결 방식',
    options: [{ id: 16, name_en: 'wireless', name_ko: '무선' }],
  },
];

const mouseIntent = {
  categoryHint: 'mouse',
  hardRequirements: ['large hand size', 'asymmetric shape'],
  preferences: [],
  priority: ['large hand size', 'asymmetric shape'],
  priceRange: { min: null, max: null, currency: null },
  summary: '큰 손에 잘 맞는 비대칭형 마우스를 찾고 있습니다.',
};

const mouseDraft = {
  categoryId: 1,
  hardRequirements: [
    { requirement: 'large hand size', filterOptionId: 9, filterId: 999 },
    { requirement: 'asymmetric shape', filterOptionId: 15 },
  ],
  preferences: [],
};

const catalogMouse = {
  id: 20,
  name_en: 'Large mouse',
  slug: 'large-mouse',
  description: 'English description',
  category: { id: 1, slug: 'mice', isVisible: true },
  filter: [{ 2: [9], 4: [15] }],
  originalPrice: 120000,
  discountedPrice: 90000,
  discountRate: 25,
};

const mouseRecommendation = {
  answer: '확인된 조건에 맞는 후보를 추천합니다.',
  recommendations: [{ productId: 20, reason: '큰 손 조건을 충족합니다.' }],
};

const createRequest = (body: unknown) =>
  new Request('http://localhost/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/ai/product-assistant', () => {
  beforeEach(() => {
    mocks.getRequiredUserId.mockResolvedValue('private-user-id');
    mocks.findCategories.mockResolvedValue(categories);
    mocks.getProductsPage.mockResolvedValue({ items: [] });
    const filterRows = filters.map(({ options, ...filter }) => ({
      ...filter,
      filterOption: options.map((option) => ({
        ...option,
        filterId: filter.id,
        categoryName: filter.categoryName,
      })),
    }));
    filterRows[0].filterOption.push({
      id: 17,
      name_en: 'other-category-option',
      name_ko: '다른 카테고리',
      filterId: 2,
      categoryName: 'keyboards',
    });
    mocks.findFilters.mockResolvedValue(filterRows);
    mocks.generateGeminiStructuredOutput.mockReset().mockResolvedValue({
      intent: mouseIntent,
      mappingDraft: mouseDraft,
    });
  });

  it('로그인하지 않은 요청은 Gemini 호출 전에 거부한다', async () => {
    mocks.getRequiredUserId.mockRejectedValue(new UnauthorizedError());

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(401);
    expect(mocks.findCategories).not.toHaveBeenCalled();
    expect(mocks.generateGeminiStructuredOutput).not.toHaveBeenCalled();
  });

  it.each([
    { prompt: '' },
    { prompt: '   ' },
    { prompt: 'a'.repeat(501) },
    { prompt: 123 },
    { prompt: 'A mouse', locale: 'fr' },
    {},
    null,
  ])('유효하지 않은 요청을 400으로 거부한다 (%j)', async (body) => {
    const response = await POST(createRequest(body));

    expect(response.status).toBe(400);
    expect(mocks.findCategories).not.toHaveBeenCalled();
    expect(mocks.generateGeminiStructuredOutput).not.toHaveBeenCalled();
  });

  it('JSON이 아닌 body는 공용 parser로 거부한다', async () => {
    const request = new Request('http://localhost/api/ai/product-assistant', {
      method: 'POST',
      body: '{invalid',
    });

    expect((await POST(request)).status).toBe(400);
    expect(mocks.generateGeminiStructuredOutput).not.toHaveBeenCalled();
  });

  it('분석과 추천을 각각 한 번 호출하고 후보 밖 ID와 중복 추천을 제거한다', async () => {
    mocks.getProductsPage.mockResolvedValue({
      items: [catalogMouse],
    });
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce(
        productSearchAnalysisSchema.parse({
          intent: mouseIntent,
          mappingDraft: mouseDraft,
        }),
      )
      .mockResolvedValueOnce({
        ...mouseRecommendation,
        recommendations: [
          ...mouseRecommendation.recommendations,
          { productId: 9999, reason: 'Unknown candidate' },
          { productId: 20, reason: 'Duplicate candidate' },
        ],
      });
    const response = await POST(
      createRequest({
        prompt: '  손이 큰데 비대칭인 마우스를 찾습니다.  ',
        locale: 'en',
        userId: 'injected-user-id',
        email: 'private@example.test',
        session: { token: 'private-session' },
        cart: ['private-cart-product'],
      }),
    );

    expect(mocks.getRequiredUserId).toHaveBeenCalledOnce();
    expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledTimes(2);
    expect(mocks.generateGeminiStructuredOutput).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        'User question:\n손이 큰데 비대칭인 마우스를 찾습니다.',
      ),
      productSearchAnalysisSchema,
      { thinkingLevel: 'low' },
    );
    const [prompt] = mocks.generateGeminiStructuredOutput.mock.calls[0] as [
      string,
    ];
    const catalogJson = prompt.match(
      /Catalog:\n([^\n]+)\n\nUser question:/,
    )?.[1];
    expect(JSON.parse(catalogJson ?? 'null')).toEqual({ categories, filters });
    expect(prompt).toMatch(/do not recommend products/i);
    expect(prompt).toMatch(/only .*catalog/i);
    expect(prompt).toMatch(/do not guess/i);
    expect(prompt).toMatch(/extract intent.*independently of the catalog/i);
    expect(prompt).toMatch(
      /preserve every explicit product condition.*no matching filter option/i,
    );
    expect(prompt).toMatch(
      /explicitly requested product attributes.*hardRequirements/i,
    );
    expect(prompt).toMatch(/preferences only.*optional.*preferred/i);
    expect(prompt).toMatch(
      /never omit or downgrade.*preferences.*cannot be mapped/i,
    );
    expect(prompt).toMatch(/keep it in intent.*server.*unmatched/i);
    expect(prompt).toMatch(/lowercase English product type/i);
    expect(prompt).toMatch(/general purpose.*condition arrays empty/i);
    expect(prompt).toMatch(/without converting currency/i);
    expect(prompt).toMatch(/same language as the user/i);
    expect(prompt).not.toMatch(/private-|injected-user-id|private@example/);
    const [recommendationPrompt, recommendationSchema, recommendationOptions] =
      mocks.generateGeminiStructuredOutput.mock.calls[1];
    expect(recommendationSchema).toBe(productRecommendationSchema);
    expect(recommendationOptions).toEqual({ thinkingLevel: 'minimal' });
    expect(recommendationPrompt).toMatch(/only.*candidates/i);
    expect(recommendationPrompt).toMatch(/language.*userQuestion/i);
    expect(recommendationPrompt).toMatch(/unmatchedHardRequirements/i);
    expect(recommendationPrompt).toMatch(
      /do not repeat warnings.*unmatched.*unverifiable.*answer/i,
    );
    expect(recommendationPrompt).toMatch(/UI.*warnings separately/i);
    expect(recommendationPrompt).toMatch(
      /do not say.*no matching product information.*no matching products exist.*conditions cannot be satisfied/i,
    );
    expect(recommendationPrompt).toMatch(
      /recommendation positively and accurately.*verified conditions/i,
    );
    expect(recommendationPrompt).toMatch(
      /never claim.*satisfies any unmatchedHardRequirements/i,
    );
    expect(recommendationPrompt).not.toMatch(
      /private-|injected-user-id|private@example|Catalog:|filterOptionId|large-mouse/,
    );
    const recommendationInput = JSON.parse(
      recommendationPrompt.split('\n\nInput:\n')[1],
    );
    expect(recommendationInput).toEqual({
      userQuestion: '손이 큰데 비대칭인 마우스를 찾습니다.',
      intent: {
        hardRequirements: mouseIntent.hardRequirements,
        preferences: [],
        priority: mouseIntent.priority,
        priceRange: mouseIntent.priceRange,
      },
      verifiedRequirements: mouseIntent.hardRequirements,
      unmatchedHardRequirements: [],
      priceRangeApplied: false,
      candidates: [
        {
          id: 20,
          description: 'English description',
          discountedPrice: 90000,
          matchedPreferences: [],
        },
      ],
    });
    expect(mocks.findCategories).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        where: {
          isVisible: true,
          OR: [
            { parentId: null },
            { parent: { parentId: null, isVisible: true } },
          ],
        },
        select: { id: true, slug: true, name_en: true, name_ko: true },
      }),
    );
    expect(mocks.findFilters).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        where: { categoryName: { in: ['mice', 'keyboards'] } },
        select: {
          id: true,
          name: true,
          categoryName: true,
          filterOption: expect.objectContaining({
            select: {
              id: true,
              name_en: true,
              name_ko: true,
              categoryName: true,
              filterId: true,
            },
          }),
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(mocks.getProductsPage).toHaveBeenCalledExactlyOnceWith(
      'mice',
      undefined,
      undefined,
      'relevance',
      ['9', '15'],
      {},
      {},
      {},
      'en',
    );
    expect(await response.json()).toEqual({
      items: {
        intent: mouseIntent,
        mapping: {
          category: { id: 1, slug: 'mice' },
          hardRequirements: [
            { requirement: 'large hand size', filterId: 2, filterOptionId: 9 },
            {
              requirement: 'asymmetric shape',
              filterId: 4,
              filterOptionId: 15,
            },
          ],
          preferences: [],
          unmatchedHardRequirements: [],
          unmatchedPreferences: [],
        },
        candidates: [
          {
            id: 20,
            name: 'Large mouse',
            slug: 'large-mouse',
            description: 'English description',
            categorySlug: 'mice',
            originalPrice: 120000,
            discountedPrice: 90000,
            discountRate: 25,
            matchedPreferences: [],
          },
        ],
        recommendation: mouseRecommendation,
      },
      message: API_MESSAGE.SUCCESS,
    });
  });

  it.each([99999, 16, 17])(
    '허용되지 않은 옵션 %i를 unmatched로 남긴다',
    async (filterOptionId) => {
      mocks.generateGeminiStructuredOutput.mockResolvedValue({
        intent: mouseIntent,
        mappingDraft: {
          ...mouseDraft,
          hardRequirements: [
            { requirement: 'large hand size', filterOptionId },
            mouseDraft.hardRequirements[1],
          ],
        },
      });

      const response = await POST(
        createRequest({ prompt: 'A large asymmetric mouse?' }),
      );

      expect(response.status).toBe(200);
      expect((await response.json()).items.mapping).toMatchObject({
        hardRequirements: [
          { requirement: 'asymmetric shape', filterId: 4, filterOptionId: 15 },
        ],
        unmatchedHardRequirements: ['large hand size'],
      });
    },
  );

  it.each([
    { categoryHint: 'mouse', categoryId: 99999 },
    { categoryHint: 'mouse', categoryId: null },
    { categoryHint: null, categoryId: 1 },
  ])(
    '유효한 카테고리가 없으면 옵션도 확정하지 않는다 (%j)',
    async ({ categoryHint, categoryId }) => {
      mocks.generateGeminiStructuredOutput.mockResolvedValue({
        intent: { ...mouseIntent, categoryHint },
        mappingDraft: { ...mouseDraft, categoryId },
      });

      const response = await POST(
        createRequest({ prompt: 'Something for work?' }),
      );

      expect(response.status).toBe(200);
      expect(mocks.getProductsPage).not.toHaveBeenCalled();
      const { items } = await response.json();
      expect(items.candidates).toEqual([]);
      expect(items.recommendation).toBeNull();
      expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledOnce();
      expect(items.mapping).toEqual({
        category: null,
        hardRequirements: [],
        preferences: [],
        unmatchedHardRequirements: mouseIntent.hardRequirements,
        unmatchedPreferences: [],
      });
    },
  );

  it('필수 조건과 선호 조건을 구분하고 누락된 조건과 가격을 보존한다', async () => {
    mocks.getProductsPage.mockResolvedValue({
      items: [
        {
          id: 20,
          name_en: '큰 마우스',
          slug: 'large-mouse',
          description: '한국어 설명',
          category: { id: 1, slug: 'mice', isVisible: true },
          filter: [{ 2: [9] }],
          originalPrice: 120000,
          discountedPrice: 90000,
          discountRate: 25,
        },
      ],
    });
    const intent = {
      ...mouseIntent,
      hardRequirements: ['large hand size', 'solar charging'],
      preferences: ['asymmetric shape', 'black color'],
      priceRange: { min: null, max: 100000, currency: 'KRW' },
    };
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({
        intent,
        mappingDraft: {
          ...mouseDraft,
          preferences: [
            { requirement: 'asymmetric shape', filterOptionId: 15 },
          ],
        },
      })
      .mockResolvedValueOnce(mouseRecommendation);

    const response = await POST(
      createRequest({ prompt: 'A mouse under 100000 KRW?' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage).toHaveBeenCalledExactlyOnceWith(
      'mice',
      undefined,
      undefined,
      'relevance',
      ['9'],
      {},
      {},
      {},
      'ko',
    );
    const recommendationPrompt: string =
      mocks.generateGeminiStructuredOutput.mock.calls[1][0];
    const recommendationInput = JSON.parse(
      recommendationPrompt.split('\n\nInput:\n')[1],
    );
    expect(recommendationInput.unmatchedHardRequirements).toEqual([
      'solar charging',
    ]);
    expect(recommendationInput.priceRangeApplied).toBe(true);
    expect((await response.json()).items).toEqual({
      intent,
      mapping: {
        category: { id: 1, slug: 'mice' },
        hardRequirements: [
          { requirement: 'large hand size', filterId: 2, filterOptionId: 9 },
        ],
        preferences: [
          { requirement: 'asymmetric shape', filterId: 4, filterOptionId: 15 },
        ],
        unmatchedHardRequirements: ['solar charging'],
        unmatchedPreferences: ['black color'],
      },
      candidates: [
        {
          id: 20,
          name: '큰 마우스',
          slug: 'large-mouse',
          description: '한국어 설명',
          categorySlug: 'mice',
          originalPrice: 120000,
          discountedPrice: 90000,
          discountRate: 25,
          matchedPreferences: [],
        },
      ],
      recommendation: mouseRecommendation,
    });
  });

  it('500자 질문을 허용한다', async () => {
    const response = await POST(createRequest({ prompt: 'a'.repeat(500) }));

    expect(response.status).toBe(200);
    expect((await response.json()).items).toMatchObject({
      candidates: [],
      recommendation: null,
    });
    expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledOnce();
  });

  it('12개 후보 중 선택된 3개의 추천 순서를 유지한다', async () => {
    mocks.getProductsPage.mockResolvedValue({
      items: Array.from({ length: 12 }, (_, index) => ({
        ...catalogMouse,
        id: 20 + index,
      })),
    });
    const recommendations = [31, 20, 27].map((productId) => ({
      productId,
      reason: 'Verified candidate.',
    }));
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({ intent: mouseIntent, mappingDraft: mouseDraft })
      .mockResolvedValueOnce({
        answer: 'Compare these choices.',
        recommendations,
      });

    const response = await POST(createRequest({ prompt: 'A large mouse?' }));

    expect(response.status).toBe(200);
    const { items } = await response.json();
    expect(items.candidates).toHaveLength(12);
    expect(items.recommendation.recommendations).toEqual(recommendations);
  });

  it.each(['invalid IDs', 'provider error'])(
    '두 번째 Gemini 호출이 실패하면 안전한 500을 반환한다 (%s)',
    async (failure) => {
      mocks.getProductsPage.mockResolvedValue({ items: [catalogMouse] });
      mocks.generateGeminiStructuredOutput.mockResolvedValueOnce({
        intent: mouseIntent,
        mappingDraft: mouseDraft,
      });
      if (failure === 'invalid IDs') {
        mocks.generateGeminiStructuredOutput.mockResolvedValueOnce({
          answer: 'Unknown product.',
          recommendations: [{ productId: 9999, reason: 'Unknown.' }],
        });
      } else {
        mocks.generateGeminiStructuredOutput.mockRejectedValueOnce(
          new Error('private-provider-output'),
        );
      }
      const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

      const response = await POST(createRequest({ prompt: 'A large mouse?' }));

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        message: API_MESSAGE.INTERNAL_SERVER_ERROR,
      });
      expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledTimes(2);
      expect(errorLog.mock.calls.flat().map(String).join(' ')).not.toContain(
        'private-provider-output',
      );
    },
  );

  it('Gemini 오류의 원문을 응답이나 로그에 노출하지 않는다', async () => {
    const sensitiveError = new Error(
      'private-api-key private-prompt private-answer private-session',
    );
    mocks.generateGeminiStructuredOutput.mockRejectedValue(sensitiveError);
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      message: API_MESSAGE.INTERNAL_SERVER_ERROR,
    });
    expect(errorLog).toHaveBeenCalledOnce();
    for (const value of errorLog.mock.calls.flat()) {
      expect(String(value)).not.toContain('private-');
      expect(value).not.toBe(sensitiveError);
    }
  });
});
