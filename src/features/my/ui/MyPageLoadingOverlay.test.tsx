import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MyPageLoadingContext } from '../model/context/MyPageLoadingContext';

import MyPageLoadingOverlay from './MyPageLoadingOverlay';

describe('MyPageLoadingOverlay', () => {
  it('탭 전환 중에는 내부 콘텐츠 로더를 숨기고 탭 로더만 표시한다', () => {
    render(
      <MyPageLoadingContext.Provider value={{ isTabTransitionPending: true }}>
        <MyPageLoadingOverlay label="탭을 불러오는 중" />
        <MyPageLoadingOverlay
          label="주문 목록을 불러오는 중"
          hideDuringTabTransition
        />
      </MyPageLoadingContext.Provider>,
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
      <MyPageLoadingContext.Provider value={{ isTabTransitionPending: false }}>
        <MyPageLoadingOverlay
          label="주문 목록을 불러오는 중"
          hideDuringTabTransition
        />
      </MyPageLoadingContext.Provider>,
    );

    expect(
      screen.getByRole('status', { name: '주문 목록을 불러오는 중' }),
    ).toBeInTheDocument();
  });
});
