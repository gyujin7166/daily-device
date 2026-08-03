import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useMyPageShellStore } from './myPageShellStore';

describe('useMyPageShellStore', () => {
  beforeEach(() => {
    useMyPageShellStore.getState().actions.resetMyPageShellState();
  });

  it('모바일 메뉴를 열고 닫는다', () => {
    act(() => {
      useMyPageShellStore.getState().actions.openMobileMenu();
    });
    expect(useMyPageShellStore.getState().isMobileMenuOpen).toBe(true);

    act(() => {
      useMyPageShellStore.getState().actions.closeMobileMenu();
    });
    expect(useMyPageShellStore.getState().isMobileMenuOpen).toBe(false);
  });

  it('이동 중인 탭을 저장하고 Shell 상태를 초기화한다', () => {
    act(() => {
      useMyPageShellStore.getState().actions.setPendingTab('orders');
    });
    expect(useMyPageShellStore.getState().pendingTab).toBe('orders');

    act(() => {
      useMyPageShellStore.getState().actions.resetMyPageShellState();
    });
    expect(useMyPageShellStore.getState()).toMatchObject({
      isMobileMenuOpen: false,
      pendingTab: null,
    });
  });
});
