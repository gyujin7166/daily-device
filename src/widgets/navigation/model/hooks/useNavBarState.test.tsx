import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useNavBarState from './useNavBarState';

describe('useNavBarState', () => {
  const setIsDropdownOpen = vi.fn();
  const handleToggleSearch = vi.fn();
  let now = 1_000;

  beforeEach(() => {
    now = 1_000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  const renderNavBarState = () =>
    renderHook(() =>
      useNavBarState({
        headerVisible: true,
        routerPath: '/',
        setIsDropdownOpen,
        handleToggleSearch,
      }),
    );

  it('카테고리 선택 후에는 마우스가 벗어날 때까지 드롭다운을 다시 열지 않는다', () => {
    const { result } = renderNavBarState();

    act(() => {
      result.current.handleMouseEnter();
    });
    expect(setIsDropdownOpen).toHaveBeenLastCalledWith(true);

    setIsDropdownOpen.mockClear();
    act(() => {
      result.current.handleDropdownNavigate();
    });
    expect(setIsDropdownOpen).toHaveBeenLastCalledWith(false);

    setIsDropdownOpen.mockClear();
    act(() => {
      result.current.handleMouseMove();
    });
    expect(setIsDropdownOpen).not.toHaveBeenCalled();

    act(() => {
      result.current.handleMouseLeave();
      result.current.handleMouseEnter();
    });
    expect(setIsDropdownOpen).toHaveBeenLastCalledWith(true);
  });

  it('스크롤로 닫힌 드롭다운은 cooldown 이후 마우스를 움직이면 다시 연다', () => {
    const { result } = renderNavBarState();

    act(() => {
      result.current.handleMouseEnter();
    });
    setIsDropdownOpen.mockClear();

    now = 1_050;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(setIsDropdownOpen).toHaveBeenLastCalledWith(false);

    setIsDropdownOpen.mockClear();
    now = 1_100;
    act(() => {
      result.current.handleMouseMove();
    });
    expect(setIsDropdownOpen).not.toHaveBeenCalled();

    now = 1_191;
    act(() => {
      result.current.handleMouseMove();
    });
    expect(setIsDropdownOpen).toHaveBeenLastCalledWith(true);
  });
});
