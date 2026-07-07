import { describe, expect, it } from 'vitest';

import {
  bumpCartVariantMutationRevision,
  getCartVariantMutationRevision,
  isCartVariantMutationCurrent,
} from './cartMutationRevision';

describe('cart mutation revision', () => {
  it('variant별 revision을 독립적으로 증가시킨다', () => {
    const firstVariantKey = 'revision-test:first';
    const secondVariantKey = 'revision-test:second';

    expect(getCartVariantMutationRevision(firstVariantKey)).toBe(0);
    expect(bumpCartVariantMutationRevision(firstVariantKey)).toBe(1);
    expect(bumpCartVariantMutationRevision(firstVariantKey)).toBe(2);
    expect(getCartVariantMutationRevision(secondVariantKey)).toBe(0);
  });

  it('최신 revision만 현재 mutation으로 판단한다', () => {
    const variantKey = 'revision-test:current';
    const firstRevision = bumpCartVariantMutationRevision(variantKey);
    const latestRevision = bumpCartVariantMutationRevision(variantKey);

    expect(isCartVariantMutationCurrent(variantKey, firstRevision)).toBe(false);
    expect(isCartVariantMutationCurrent(variantKey, latestRevision)).toBe(true);
  });

  it('revision이 없는 기존 호출은 현재 mutation으로 판단한다', () => {
    expect(
      isCartVariantMutationCurrent('revision-test:legacy', undefined),
    ).toBe(true);
  });
});
