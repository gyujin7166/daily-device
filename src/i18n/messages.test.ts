import { describe, expect, it } from 'vitest';

import enMessages from '../../messages/en.json';
import koMessages from '../../messages/ko.json';

const ICU_ARGUMENT_PATTERN = /\{\s*([A-Za-z_][\w.-]*)\s*(?:,|\})/g;

const isMessageContainer = (
  value: unknown,
): value is Record<string, unknown> | unknown[] =>
  typeof value === 'object' && value !== null;

const flattenMessages = (messages: unknown) => {
  const flattened = new Map<string, string>();

  const visit = (value: unknown, path: string) => {
    if (typeof value === 'string') {
      flattened.set(path, value);
      return;
    }

    if (!isMessageContainer(value)) {
      throw new TypeError(`Unsupported message value at "${path}".`);
    }

    Object.entries(value).forEach(([key, child]) => {
      visit(child, path ? `${path}.${key}` : key);
    });
  };

  visit(messages, '');
  return flattened;
};

const getIcuArguments = (message: string) =>
  Array.from(
    new Set(
      Array.from(message.matchAll(ICU_ARGUMENT_PATTERN), (match) => match[1]),
    ),
  ).sort();

describe('i18n 번역 카탈로그', () => {
  const enCatalog = flattenMessages(enMessages);
  const koCatalog = flattenMessages(koMessages);

  it('한국어와 영어의 번역 키가 일치한다', () => {
    expect(Array.from(koCatalog.keys()).sort()).toEqual(
      Array.from(enCatalog.keys()).sort(),
    );
  });

  it('같은 번역 키의 ICU placeholder가 일치한다', () => {
    const mismatches = Array.from(koCatalog.keys())
      .filter((key) => enCatalog.has(key))
      .flatMap((key) => {
        const koArguments = getIcuArguments(koCatalog.get(key) ?? '');
        const enArguments = getIcuArguments(enCatalog.get(key) ?? '');

        return JSON.stringify(koArguments) === JSON.stringify(enArguments)
          ? []
          : [{ key, koArguments, enArguments }];
      });

    expect(mismatches).toEqual([]);
  });
});
