'use client';

import { useEffect, useState } from 'react';

import { inputClass } from './AdminControls';

import type { InputHTMLAttributes } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

type DebouncedSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'defaultValue' | 'onChange' | 'value'
> & {
  value: string;
  onChange: (value: string) => void;
};

export function DebouncedSearchInput({
  value,
  onChange,
  className = inputClass,
  ...props
}: DebouncedSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue === value) {
      return;
    }

    const timer = window.setTimeout(() => {
      onChange(inputValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [inputValue, onChange, value]);

  return (
    <input
      {...props}
      className={className}
      value={inputValue}
      onChange={(event) => setInputValue(event.target.value)}
    />
  );
}
