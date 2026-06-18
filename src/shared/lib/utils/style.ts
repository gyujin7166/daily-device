import type { CSSProperties } from 'react';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ClassValue } from 'clsx';

export type CSSVariableStyle = CSSProperties &
  Record<`--${string}`, string | number | undefined>;

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
