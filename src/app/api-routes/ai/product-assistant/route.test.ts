import { beforeEach, describe, expect, it, vi } from 'vitest';

import { API_MESSAGE } from '@shared/constants/apiMessage';
import { UnauthorizedError } from '@shared/lib/errors/httpError';

import { POST } from './route';

const mocks = vi.hoisted(() => ({
  getRequiredUserId: vi.fn(),
  generateGeminiText: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@shared/lib/api/getRequiredUserId', () => ({
  getRequiredUserId: mocks.getRequiredUserId,
}));
vi.mock('@shared/lib/gemini/generateGeminiText', () => ({
  generateGeminiText: mocks.generateGeminiText,
}));

const createRequest = (body: unknown) =>
  new Request('http://localhost/api/ai/product-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/ai/product-assistant', () => {
  beforeEach(() => {
    mocks.getRequiredUserId.mockResolvedValue('private-user-id');
    mocks.generateGeminiText.mockResolvedValue('Choose a comfortable shape.');
  });

  it('로그인하지 않은 요청은 Gemini 호출 전에 거부한다', async () => {
    mocks.getRequiredUserId.mockRejectedValue(new UnauthorizedError());

    const response = await POST(
      createRequest({ prompt: 'A comfortable mouse?' }),
    );

    expect(response.status).toBe(401);
    expect(mocks.generateGeminiText).not.toHaveBeenCalled();
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
    expect(mocks.generateGeminiText).not.toHaveBeenCalled();
  });

  it('JSON이 아닌 body는 공용 parser로 거부한다', async () => {
    const request = new Request('http://localhost/api/ai/product-assistant', {
      method: 'POST',
      body: '{invalid',
    });

    expect((await POST(request)).status).toBe(400);
    expect(mocks.generateGeminiText).not.toHaveBeenCalled();
  });

  it('질문을 low thinking으로 보내고 짧은 plain text 답변을 요청한다', async () => {
    const response = await POST(
      createRequest({
        prompt: '  I need a comfortable mouse.  ',
        userId: 'injected-user-id',
        email: 'private@example.test',
        session: { token: 'private-session' },
        cart: ['private-cart-product'],
      }),
    );

    expect(mocks.getRequiredUserId).toHaveBeenCalledOnce();
    expect(mocks.generateGeminiText).toHaveBeenCalledOnce();
    const [prompt] = mocks.generateGeminiText.mock.calls[0] as [string];
    expect(prompt).toContain('Daily Device');
    expect(prompt).toContain(
      'not connected to the actual Daily Device product database',
    );
    expect(prompt).toContain('Do not invent');
    expect(prompt).toContain('prices');
    expect(prompt).toContain('Do not claim to have searched');
    expect(prompt).toContain('same language as the user');
    expect(prompt).toMatch(/short and direct/i);
    expect(prompt).toMatch(/at most 3 short points/i);
    expect(prompt).toMatch(/do not write a long buying guide/i);
    expect(prompt).toMatch(/plain text only/i);
    expect(prompt).toMatch(/do not use markdown/i);
    expect(mocks.generateGeminiText).toHaveBeenCalledWith(
      expect.stringContaining('User question:\nI need a comfortable mouse.'),
      { thinkingLevel: 'low' },
    );
    expect(prompt).not.toMatch(/private-|injected-user-id|private@example/);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: { answer: 'Choose a comfortable shape.' },
      message: API_MESSAGE.SUCCESS,
    });
  });

  it('500자 질문을 허용한다', async () => {
    const response = await POST(createRequest({ prompt: 'a'.repeat(500) }));

    expect(response.status).toBe(200);
    expect(mocks.generateGeminiText).toHaveBeenCalledOnce();
  });

  it('Gemini 오류의 원문을 응답이나 로그에 노출하지 않는다', async () => {
    const sensitiveError = new Error(
      'private-api-key private-prompt private-answer private-session',
    );
    mocks.generateGeminiText.mockRejectedValue(sensitiveError);
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
