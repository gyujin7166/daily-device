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

  it('SDK 요청 실패를 호출자에게 전달한다', async () => {
    const error = new Error('Request failed');
    mocks.create.mockRejectedValue(error);

    await expect(generateGeminiText('Say hello.')).rejects.toBe(error);
  });
});
