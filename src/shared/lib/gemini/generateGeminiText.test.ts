import { inspect } from 'node:util';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateGeminiText } from './generateGeminiText';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  GoogleGenAI: vi.fn(),
}));

vi.mock('server-only', () => ({}));
vi.mock('@google/genai', () => ({
  GoogleGenAI: mocks.GoogleGenAI,
}));

describe('generateGeminiText', () => {
  beforeEach(() => {
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key');
    vi.stubEnv('GEMINI_MODEL', undefined);
    mocks.GoogleGenAI.mockImplementation(function () {
      return { interactions: { create: mocks.create } };
    });
    mocks.create.mockResolvedValue({
      status: 'completed',
      output_text: 'Connection works.',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('옵션이 없으면 기존 요청 형식으로 기본 모델에 prompt를 전달한다', async () => {
    await expect(generateGeminiText('Say hello.')).resolves.toBe(
      'Connection works.',
    );
    expect(mocks.GoogleGenAI).toHaveBeenCalledWith({
      apiKey: 'test-gemini-key',
    });
    expect(mocks.create).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash-lite',
      input: 'Say hello.',
      store: false,
    });
  });

  it('호출별 thinking level을 Interactions 설정에 전달한다', async () => {
    await generateGeminiText('Say hello.', { thinkingLevel: 'low' });

    expect(mocks.create).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash-lite',
      input: 'Say hello.',
      store: false,
      generation_config: { thinking_level: 'low' },
    });
  });

  it.each([undefined, '', '   '])(
    'API key가 비어 있으면 요청 전에 명확하게 실패한다 (%s)',
    async (apiKey) => {
      vi.stubEnv('GEMINI_API_KEY', apiKey);

      await expect(generateGeminiText('Say hello.')).rejects.toThrow(
        'GEMINI_API_KEY is required to call Gemini.',
      );
      expect(mocks.GoogleGenAI).not.toHaveBeenCalled();
      expect(mocks.create).not.toHaveBeenCalled();
    },
  );

  it('환경변수로 지정한 모델을 사용한다', async () => {
    vi.stubEnv('GEMINI_MODEL', ' custom-gemini-model ');

    await generateGeminiText('Say hello.');

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'custom-gemini-model' }),
    );
  });

  it.each(['', '   '])(
    '모델이 비어 있으면 기본 모델을 사용한다 (%s)',
    async (model) => {
      vi.stubEnv('GEMINI_MODEL', model);

      await generateGeminiText('Say hello.');

      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'gemini-3.5-flash-lite' }),
      );
    },
  );

  it.each([undefined, '', ' \n '])(
    '응답 텍스트가 비어 있으면 정상 결과로 반환하지 않는다 (%s)',
    async (text) => {
      mocks.create.mockResolvedValue({
        status: 'completed',
        output_text: text,
      });

      await expect(generateGeminiText('Say hello.')).rejects.toThrow(
        'Gemini returned an empty text response.',
      );
    },
  );

  it('완료되지 않은 응답은 텍스트가 있어도 실패한다', async () => {
    mocks.create.mockResolvedValue({
      status: 'incomplete',
      output_text: 'Partial response',
    });

    await expect(generateGeminiText('Say hello.')).rejects.toThrow(
      'Gemini interaction did not complete.',
    );
  });

  it('완료되지 않은 응답은 incomplete 원인으로 구분한다', async () => {
    mocks.create.mockResolvedValue({ status: 'incomplete', output_text: '' });

    await expect(generateGeminiText('Say hello.')).rejects.toMatchObject({
      name: 'GeminiError',
      reason: 'incomplete',
    });
  });

  it.each([
    {
      label: '요청 한도 초과',
      error: Object.assign(new Error('429 private-quota-detail'), {
        name: 'RateLimitError',
        status: 429,
      }),
      expected: {
        reason: 'rate_limited',
        status: 429,
        providerErrorName: 'RateLimitError',
      },
    },
    {
      label: '타임아웃',
      error: Object.assign(new Error('private-timeout-detail'), {
        name: 'APIConnectionTimeoutError',
      }),
      expected: {
        reason: 'timeout',
        status: undefined,
        providerErrorName: 'APIConnectionTimeoutError',
      },
    },
    {
      label: '기타 provider 오류',
      error: Object.assign(new Error('private-server-detail'), {
        name: 'CreateInteractionServerError',
        statusCode: 503,
        body: 'private-response-body',
      }),
      expected: {
        reason: 'provider_error',
        status: 503,
        providerErrorName: 'CreateInteractionServerError',
      },
    },
  ])(
    'SDK $label 오류를 안전한 원인 정보만 가진 GeminiError로 바꾼다',
    async ({ error, expected }) => {
      mocks.create.mockRejectedValue(error);

      const thrown = await generateGeminiText('Say hello.').catch(
        (reason: unknown) => reason,
      );

      expect(thrown).toMatchObject({ name: 'GeminiError', ...expected });
      expect(inspect(thrown, { depth: Infinity })).not.toContain('private-');
    },
  );

  it('provider 오류 이름이 식별자 형식이 아니면 남기지 않는다', async () => {
    mocks.create.mockRejectedValue(
      Object.assign(new Error('failed'), { name: 'private name <value>' }),
    );

    await expect(generateGeminiText('Say hello.')).rejects.toMatchObject({
      reason: 'provider_error',
      providerErrorName: undefined,
    });
  });
});
