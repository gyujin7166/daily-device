import type { CSSProperties } from 'react';

import type { TransitionStatus } from 'react-transition-group';

export type TransitionStyle = Partial<Record<TransitionStatus, CSSProperties>>;

export const getTransitionStyle = (
  transitionStyles: TransitionStyle,
  state: TransitionStatus,
) => transitionStyles[state] ?? {};
