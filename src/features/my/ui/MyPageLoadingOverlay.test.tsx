import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMyPageShellStore } from '../model/store/myPageShellStore';

import MyPageLoadingOverlay from './MyPageLoadingOverlay';

const mocks = vi.hoisted(() => ({
  pathname: '/my',
}));

vi.mock('@shared/lib/i18n/navigation', () => ({
  usePathname: () => mocks.pathname,
}));

describe('MyPageLoadingOverlay', () => {
  beforeEach(() => {
    mocks.pathname = '/my';
    useMyPageShellStore.getState().actions.resetMyPageShellState();
  });

  it('탭 전환 중에는 내부 콘텐츠 로더를 숨기고 탭 로더만 표시한다', () => {
    act(() => {
      useMyPageShellStore.getState().actions.setPendingTab('orders');
    });

    render(
      <>
        <MyPageLoadingOverlay label="탭을 불러오는 중" />
        <MyPageLoadingOverlay
          label="주문 목록을 불러오는 중"
          hideDuringTabTransition
        />
      </>,
    );

    expect(
      screen.getByRole('status', { name: '탭을 불러오는 중' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: '주문 목록을 불러오는 중' }),
    ).not.toBeInTheDocument();
  });

  it('탭 전환 중이 아니면 내부 콘텐츠 로더를 표시한다', () => {
    render(
      <MyPageLoadingOverlay
        label="주문 목록을 불러오는 중"
        hideDuringTabTransition
      />,
    );

    expect(
      screen.getByRole('status', { name: '주문 목록을 불러오는 중' }),
    ).toBeInTheDocument();
  });
});
