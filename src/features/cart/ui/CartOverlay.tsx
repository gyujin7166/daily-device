import { useRef } from 'react';

import { Transition } from 'react-transition-group';

import { useCartContext } from '@entities/cart/model/context/CartContext';

import { cn } from '@shared/lib/utils/style';
import { getTransitionStyle } from '@shared/types/transition';
import type { TransitionStyle } from '@shared/types/transition';

const duration = 220;
const defaultStyle = {
  transition: `opacity ${duration}ms ease`,
  opacity: 0,
  background: '#2f3132',
};

const transitionStyles: TransitionStyle = {
  entering: {
    opacity: 0.4,
  },
  entered: {
    opacity: 0.4,
  },
  exiting: {
    opacity: 0,
  },
  exited: {
    opacity: 0,
  },
};

export default function CartOverlay() {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const { isCartOpen } = useCartContext();

  return (
    <Transition nodeRef={nodeRef} in={isCartOpen} timeout={220} unmountOnExit>
      {(state) => (
        <div
          ref={nodeRef}
          className={cn('fixed top-0 h-full w-full', isCartOpen && 'z-40')}
          style={{
            ...defaultStyle,
            ...getTransitionStyle(transitionStyles, state),
          }}
        />
      )}
    </Transition>
  );
}
