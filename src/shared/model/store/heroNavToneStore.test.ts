import { beforeEach, describe, expect, it } from 'vitest';

import { useHeroNavToneStore } from './heroNavToneStore';

beforeEach(() => {
  useHeroNavToneStore.getState().resetHeroNavTone();
});

describe('useHeroNavToneStore', () => {
  it('내비게이션 톤을 변경한다', () => {
    useHeroNavToneStore.getState().setHeroNavTone('dark');

    expect(useHeroNavToneStore.getState().heroNavTone).toBe('dark');
  });

  it('내비게이션 톤을 기본값으로 초기화한다', () => {
    useHeroNavToneStore.getState().setHeroNavTone('dark');

    useHeroNavToneStore.getState().resetHeroNavTone();

    expect(useHeroNavToneStore.getState().heroNavTone).toBe('light');
  });
});
