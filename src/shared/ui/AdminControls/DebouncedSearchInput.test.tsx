import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DebouncedSearchInput } from './DebouncedSearchInput';

describe('DebouncedSearchInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력값은 즉시 표시하고 마지막 검색어만 지연해서 전달한다', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(
      <DebouncedSearchInput value="" onChange={onChange} placeholder="검색" />,
    );

    const input = screen.getByPlaceholderText('검색');

    fireEvent.change(input, { target: { value: '마' } });
    fireEvent.change(input, { target: { value: '마우스' } });

    expect(input).toHaveValue('마우스');
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('마우스');
  });
});
