import { inspect } from 'node:util';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { productRecommendationSchema } from '@features/ai-product-assistant/model/productRecommendation';
import { productSearchAnalysisSchema } from '@features/ai-product-assistant/model/productSearchMapping';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { UnauthorizedError } from '@shared/lib/errors/httpError';
import { GeminiError } from '@shared/lib/gemini/geminiError';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  getRequiredUserId: vi.fn(),
  generateGeminiStructuredOutput: vi.fn(),
  findCategories: vi.fn(),
  findFilters: vi.fn(),
  findColors: vi.fn(),
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
    color: { findMany: mocks.findColors },
  },
}));
vi.mock('@app/api-routes/products/service', () => ({
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
const colors = [
  { id: 7, name_ko: '라일락', name_en: 'lilac' },
  { id: 8, name_ko: '그래파이트', name_en: '그래파이트' },
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
  colors: [],
  unavailableColors: [],
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
    // The English translation is missing for graphite, so the catalog falls back to the base name.
    mocks.findColors.mockResolvedValue([
      { id: 7, name: '라일락', translations: [{ name: 'lilac' }] },
      { id: 8, name: '그래파이트', translations: [] },
    ]);
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
    expect(JSON.parse(catalogJson ?? 'null')).toEqual({
      categories,
      filters,
      colors,
    });
    expect(prompt).toMatch(
      /required color.*catalog color.*mappingDraft\.colors/i,
    );
    expect(prompt).not.toMatch(/leave .*color conditions out/i);
    expect(prompt).toMatch(/no catalog color.*same color family.*similar/i);
    expect(prompt).toMatch(/only close in brightness or tone/i);
    expect(prompt).toMatch(/neither exact nor similar.*unavailableColors/i);
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
      similarColors: [],
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
    expect(mocks.findColors).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        where: { product: { some: {} } },
        select: {
          id: true,
          name: true,
          translations: {
            where: { locale: 'en' },
            select: { name: true },
          },
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
          colors: [],
          unavailableColors: [],
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
        colors: [],
        unavailableColors: [],
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
        colors: [],
        unavailableColors: [],
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

  it('필수 색상을 카탈로그 색상으로 검증해 해당 색상 상품만 후보로 조회한다', async () => {
    const intent = {
      ...mouseIntent,
      hardRequirements: ['small hand size', 'lilac color'],
      priority: ['lilac color', 'small hand size'],
    };
    mocks.getProductsPage.mockResolvedValue({ items: [catalogMouse] });
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({
        intent,
        mappingDraft: {
          ...mouseDraft,
          hardRequirements: [
            { requirement: 'small hand size', filterOptionId: 9 },
          ],
          colors: [
            { requirement: 'lilac color', colorId: 7, match: 'exact' },
            { requirement: 'lilac color', colorId: 7, match: 'exact' },
            { requirement: 'lilac color', colorId: 99999, match: 'exact' },
            { requirement: 'not requested', colorId: 8, match: 'exact' },
          ],
        },
      })
      .mockResolvedValueOnce(mouseRecommendation);

    const response = await POST(
      createRequest({
        prompt: '라일락 색상의 작은 크기의 마우스를 추천해주세요',
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage).toHaveBeenCalledExactlyOnceWith(
      'mice',
      undefined,
      undefined,
      'relevance',
      ['9'],
      {},
      { colorIds: [7] },
      {},
      'ko',
    );
    const recommendationPrompt: string =
      mocks.generateGeminiStructuredOutput.mock.calls[1][0];
    const recommendationInput = JSON.parse(
      recommendationPrompt.split('\n\nInput:\n')[1],
    );
    expect(recommendationInput.verifiedRequirements).toEqual([
      'small hand size',
      'lilac color',
    ]);
    expect(recommendationInput.unmatchedHardRequirements).toEqual([]);
    expect((await response.json()).items.mapping).toMatchObject({
      hardRequirements: [
        { requirement: 'small hand size', filterId: 2, filterOptionId: 9 },
      ],
      colors: [
        {
          requirement: 'lilac color',
          colorId: 7,
          match: 'exact',
          name_ko: '라일락',
          name_en: 'lilac',
        },
      ],
      unavailableColors: [],
      unmatchedHardRequirements: [],
    });
  });

  it('카탈로그에 없는 색상과 선호 색상은 후보 조회에 적용하지 않는다', async () => {
    mocks.generateGeminiStructuredOutput.mockResolvedValue({
      intent: {
        ...mouseIntent,
        hardRequirements: ['large hand size', 'gold color'],
        preferences: ['lilac color'],
      },
      mappingDraft: {
        ...mouseDraft,
        colors: [
          { requirement: 'gold color', colorId: 99999, match: 'exact' },
          { requirement: 'lilac color', colorId: 7, match: 'exact' },
        ],
      },
    });

    const response = await POST(createRequest({ prompt: 'A gold mouse?' }));

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage.mock.calls[0][6]).toEqual({});
    expect((await response.json()).items.mapping).toMatchObject({
      colors: [],
      unmatchedHardRequirements: ['gold color'],
      unmatchedPreferences: ['lilac color'],
    });
  });

  it('비슷한 계열 색상은 대체 색상으로 조회하고 추천 단계에 요청 색상과 구분해 전달한다', async () => {
    mocks.getProductsPage.mockResolvedValue({ items: [catalogMouse] });
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({
        intent: {
          ...mouseIntent,
          hardRequirements: ['large hand size', 'purple color'],
        },
        mappingDraft: {
          ...mouseDraft,
          hardRequirements: [
            { requirement: 'large hand size', filterOptionId: 9 },
          ],
          colors: [
            { requirement: 'purple color', colorId: 7, match: 'similar' },
          ],
        },
      })
      .mockResolvedValueOnce(mouseRecommendation);

    const response = await POST(createRequest({ prompt: '보라색 큰 마우스' }));

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage.mock.calls[0][6]).toEqual({ colorIds: [7] });
    const recommendationPrompt: string =
      mocks.generateGeminiStructuredOutput.mock.calls[1][0];
    expect(recommendationPrompt).toMatch(
      /similarColors.*never claim .*requested color/i,
    );
    const recommendationInput = JSON.parse(
      recommendationPrompt.split('\n\nInput:\n')[1],
    );
    expect(recommendationInput.verifiedRequirements).toEqual([
      'large hand size',
    ]);
    expect(recommendationInput.similarColors).toEqual([
      { requirement: 'purple color', name_ko: '라일락', name_en: 'lilac' },
    ]);
    expect((await response.json()).items.mapping).toMatchObject({
      colors: [
        {
          requirement: 'purple color',
          colorId: 7,
          match: 'similar',
          name_ko: '라일락',
          name_en: 'lilac',
        },
      ],
      unavailableColors: [],
      unmatchedHardRequirements: [],
    });
  });

  it('같거나 비슷한 색상이 없는 필수 색상만 있으면 상품 조회와 추천을 건너뛴다', async () => {
    mocks.generateGeminiStructuredOutput.mockResolvedValue({
      intent: {
        ...mouseIntent,
        hardRequirements: ['large hand size', 'gold color'],
        preferences: ['silver color'],
      },
      mappingDraft: {
        ...mouseDraft,
        unavailableColors: [
          'gold color',
          'gold color',
          'silver color',
          'not requested',
        ],
      },
    });

    const response = await POST(createRequest({ prompt: '금색 큰 마우스' }));

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage).not.toHaveBeenCalled();
    expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledOnce();
    const { items } = await response.json();
    expect(items.candidates).toEqual([]);
    expect(items.recommendation).toBeNull();
    expect(items.mapping).toMatchObject({
      colors: [],
      unavailableColors: ['gold color'],
      unmatchedHardRequirements: [],
      unmatchedPreferences: ['silver color'],
    });
  });

  it('일부 필수 색상만 없으면 남은 색상으로 추천하고 없는 색상은 충족한다고 말하지 않게 한다', async () => {
    mocks.getProductsPage.mockResolvedValue({ items: [catalogMouse] });
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({
        intent: {
          ...mouseIntent,
          hardRequirements: ['gold or lilac color'],
        },
        mappingDraft: {
          ...mouseDraft,
          hardRequirements: [],
          colors: [
            { requirement: 'gold or lilac color', colorId: 7, match: 'exact' },
          ],
          // A color already matched is not reported as unavailable.
          unavailableColors: ['gold or lilac color'],
        },
      })
      .mockResolvedValueOnce(mouseRecommendation);

    const response = await POST(createRequest({ prompt: '금색이나 라일락' }));

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage.mock.calls[0][6]).toEqual({ colorIds: [7] });
    expect((await response.json()).items.mapping).toMatchObject({
      unavailableColors: [],
      unmatchedHardRequirements: [],
    });
  });

  it('없는 색상과 남은 색상이 함께 있으면 없는 색상을 추천 단계의 미확인 조건으로 전달한다', async () => {
    mocks.getProductsPage.mockResolvedValue({ items: [catalogMouse] });
    mocks.generateGeminiStructuredOutput
      .mockResolvedValueOnce({
        intent: {
          ...mouseIntent,
          hardRequirements: ['gold color', 'lilac color', 'solar charging'],
        },
        mappingDraft: {
          ...mouseDraft,
          hardRequirements: [],
          colors: [{ requirement: 'lilac color', colorId: 7, match: 'exact' }],
          unavailableColors: ['gold color'],
        },
      })
      .mockResolvedValueOnce(mouseRecommendation);

    const response = await POST(
      createRequest({ prompt: '금색이나 라일락 태양광 마우스' }),
    );

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage.mock.calls[0][6]).toEqual({ colorIds: [7] });
    const recommendationInput = JSON.parse(
      mocks.generateGeminiStructuredOutput.mock.calls[1][0].split(
        '\n\nInput:\n',
      )[1],
    );
    expect(recommendationInput.verifiedRequirements).toEqual(['lilac color']);
    expect(recommendationInput.unmatchedHardRequirements).toEqual([
      'solar charging',
      'gold color',
    ]);
    expect((await response.json()).items.mapping).toMatchObject({
      unavailableColors: ['gold color'],
      unmatchedHardRequirements: ['solar charging'],
    });
  });

  it('Gemini가 빠뜨린 조건도 선택한 카테고리의 같은 이름 옵션으로 검증한다', async () => {
    mocks.generateGeminiStructuredOutput.mockResolvedValue({
      intent: {
        ...mouseIntent,
        hardRequirements: ['Large', '비대칭', 'other category option'],
        preferences: ['ASYMMETRIC'],
      },
      mappingDraft: { ...mouseDraft, hardRequirements: [] },
    });

    const response = await POST(createRequest({ prompt: '큰 마우스' }));

    expect(response.status).toBe(200);
    expect(mocks.getProductsPage.mock.calls[0][4]).toEqual(['9', '15']);
    expect((await response.json()).items.mapping).toMatchObject({
      hardRequirements: [
        { requirement: 'Large', filterId: 2, filterOptionId: 9 },
        { requirement: '비대칭', filterId: 4, filterOptionId: 15 },
      ],
      preferences: [
        { requirement: 'ASYMMETRIC', filterId: 4, filterOptionId: 15 },
      ],
      unmatchedHardRequirements: ['other category option'],
    });
  });

  it('이름이 일부만 같거나 여러 옵션과 겹치는 조건은 이름으로 검증하지 않는다', async () => {
    mocks.findFilters.mockResolvedValue([
      ...['손 크기', '모양'].map((name, index) => ({
        id: index + 2,
        name,
        categoryName: 'mice',
        filterOption: [
          {
            id: index + 30,
            name_en: 'other',
            name_ko: '기타',
            filterId: index + 2,
            categoryName: 'mice',
          },
        ],
      })),
      {
        id: 5,
        name: '크기',
        categoryName: 'mice',
        filterOption: [
          {
            id: 9,
            name_en: 'large',
            name_ko: '큼',
            filterId: 5,
            categoryName: 'mice',
          },
        ],
      },
    ]);
    mocks.generateGeminiStructuredOutput.mockResolvedValue({
      intent: {
        ...mouseIntent,
        hardRequirements: ['large hand size', 'other'],
      },
      mappingDraft: { ...mouseDraft, hardRequirements: [] },
    });

    const response = await POST(createRequest({ prompt: '큰 손 마우스' }));

    expect(response.status).toBe(200);
    expect((await response.json()).items.mapping).toMatchObject({
      hardRequirements: [],
      unmatchedHardRequirements: ['large hand size', 'other'],
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
      expect(inspect(value, { depth: Infinity })).not.toContain('private-');
      expect(value).not.toBe(sensitiveError);
    }
  });

  it('Gemini 요청 한도 초과는 429와 고정 코드로 응답하고 원인 코드를 로그에 남긴다', async () => {
    mocks.generateGeminiStructuredOutput.mockRejectedValue(
      new GeminiError('rate_limited', {
        status: 429,
        providerErrorName: 'RateLimitError',
      }),
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(429);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({
      message: 'Too Many Requests',
      code: 'AI_RATE_LIMITED',
    });
    expect(errorLog).toHaveBeenCalledOnce();
    const [, loggedError] = errorLog.mock.calls[0] ?? [];
    expect(loggedError).toBeInstanceOf(Error);
    expect((loggedError as Error).cause).toEqual({
      reason: 'rate_limited',
      status: 429,
      providerErrorName: 'RateLimitError',
    });
  });

  it('그 외 Gemini 오류는 일반 500으로 응답하고 원인 코드만 로그에 남긴다', async () => {
    mocks.generateGeminiStructuredOutput.mockRejectedValue(
      new GeminiError('schema_mismatch'),
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      message: API_MESSAGE.INTERNAL_SERVER_ERROR,
    });
    expect(errorLog).toHaveBeenCalledOnce();
    const [, loggedError] = errorLog.mock.calls[0] ?? [];
    expect(loggedError).toBeInstanceOf(Error);
    expect((loggedError as Error).cause).toEqual({ reason: 'schema_mismatch' });
  });

  it('Gemini 외 오류는 오류 이름만 unexpected 원인으로 남긴다', async () => {
    mocks.findCategories.mockRejectedValue(
      Object.assign(new Error('private-database-detail'), {
        name: 'PrismaClientKnownRequestError',
        meta: { target: 'private-column' },
      }),
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(500);
    const [, loggedError] = errorLog.mock.calls[0] ?? [];
    expect((loggedError as Error).cause).toEqual({
      reason: 'unexpected',
      errorName: 'PrismaClientKnownRequestError',
    });
    expect(inspect(errorLog.mock.calls, { depth: Infinity })).not.toContain(
      'private-',
    );
  });
});
