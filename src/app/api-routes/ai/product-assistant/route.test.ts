import { beforeEach, describe, expect, it, vi } from 'vitest';

import { productSearchIntentSchema } from '@features/ai-product-assistant/model/productSearchIntent';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { UnauthorizedError } from '@shared/lib/errors/httpError';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  getRequiredUserId: vi.fn(),
  generateGeminiStructuredOutput: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@shared/lib/api/getRequiredUserId', () => ({
  getRequiredUserId: mocks.getRequiredUserId,
}));
vi.mock('@shared/lib/gemini/generateGeminiText', () => ({
  generateGeminiStructuredOutput: mocks.generateGeminiStructuredOutput,
}));

const mouseIntent = {
  categoryHint: 'mouse',
  hardRequirements: ['large hand size', 'asymmetric shape'],
  preferences: [],
  priority: ['large hand size', 'asymmetric shape'],
  priceRange: { min: null, max: null, currency: null },
  summary: '큰 손에 잘 맞는 비대칭형 마우스를 찾고 있습니다.',
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
    mocks.generateGeminiStructuredOutput.mockResolvedValue(mouseIntent);
  });

  it('로그인하지 않은 요청은 Gemini 호출 전에 거부한다', async () => {
    mocks.getRequiredUserId.mockRejectedValue(new UnauthorizedError());

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(401);
    expect(mocks.generateGeminiStructuredOutput).not.toHaveBeenCalled();
  });

  it.each([
    { prompt: '' },
    { prompt: '   ' },
    { prompt: 'a'.repeat(501) },
    { prompt: 123 },
    {},
    null,
  ])('유효하지 않은 prompt를 400으로 거부한다 (%j)', async (body) => {
    const response = await POST(createRequest(body));

    expect(response.status).toBe(400);
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

  it('질문만 전달하고 한 번의 low thinking 호출로 전체 의도를 반환한다', async () => {
    const response = await POST(
      createRequest({
        prompt: '  손이 큰데 비대칭인 마우스를 찾습니다.  ',
        userId: 'injected-user-id',
        email: 'private@example.test',
        session: { token: 'private-session' },
        cart: ['private-cart-product'],
      }),
    );

    expect(mocks.getRequiredUserId).toHaveBeenCalledOnce();
    expect(
      mocks.generateGeminiStructuredOutput,
    ).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining(
        'User question:\n손이 큰데 비대칭인 마우스를 찾습니다.',
      ),
      productSearchIntentSchema,
      { thinkingLevel: 'low' },
    );
    const [prompt] = mocks.generateGeminiStructuredOutput.mock.calls[0] as [
      string,
    ];
    expect(prompt).toMatch(/no access to the Daily Device product database/i);
    expect(prompt).toMatch(/do not recommend products/i);
    expect(prompt).toMatch(/do not invent .*IDs/i);
    expect(prompt).toMatch(/do not guess/i);
    expect(prompt).toMatch(/lowercase English product type/i);
    expect(prompt).toMatch(/general purpose.*condition arrays empty/i);
    expect(prompt).toMatch(/without converting currency/i);
    expect(prompt).toMatch(/same language as the user/i);
    expect(prompt).not.toMatch(/private-|injected-user-id|private@example/);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: { intent: mouseIntent },
      message: API_MESSAGE.SUCCESS,
    });
  });

  it('500자 질문을 허용한다', async () => {
    const response = await POST(createRequest({ prompt: 'a'.repeat(500) }));

    expect(response.status).toBe(200);
    expect(mocks.generateGeminiStructuredOutput).toHaveBeenCalledOnce();
  });

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
